package com.example.fyp.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fyp.entity.Account;
import com.example.fyp.entity.Employee;
import com.example.fyp.entity.Recording;
import com.example.fyp.model.ResponseStatus;
import com.example.fyp.repo.EmployeeRepository;
import com.example.fyp.repo.RecordingRepository;
import com.example.fyp.service.AccountServiceImpl;
import com.example.fyp.service.RecordingListService;
import com.example.fyp.service.RecordingService;
import com.example.fyp.service.UsageService;

@RestController
@RequestMapping("/recordingList")
public class RecordingController {

    private final RecordingListService recordingListService;
    private final RecordingService recordingService;
    private final AccountServiceImpl accountServiceImpl;

    @Autowired
    public RecordingController(RecordingListService recordingListService, RecordingService recordingService,
            AccountServiceImpl accountServiceImpl) {
        this.recordingListService = recordingListService;
        this.recordingService = recordingService;
        this.accountServiceImpl = accountServiceImpl;
    }

    @Autowired
    private RecordingRepository recRepo;

    @Autowired
    private EmployeeRepository empRepo;

    @Autowired
    private UsageService usageService;

    // Get All Recordings
    @GetMapping("/getAllRecordings")
    public ResponseEntity<?> getAllRecording(@RequestParam(required = false) String search) {
        ResponseStatus<List<Map<String, Object>>> response = new ResponseStatus<>();

        try {
            // Retrieve the current authentication token
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Integer account_id = accountServiceImpl.getAccountId(email);
            System.out.println("ACCOUNT ID: " + account_id);

            List<Map<String, Object>> recList = recordingListService.getRecordingList(account_id);

            System.out.println("RECORDING: " + recList);

            if (search != null && !search.isEmpty()) {
                String searchKeyword = "%" + search.toLowerCase() + "%";

                recList = recList.stream()
                        .filter(rec -> ((String) rec.get("recordingName")).contains(search))
                        .collect(Collectors.toList());
            }

            // RESPONSE DATA
            response.setSuccess(true);
            response.setMessage("Successfully Retrieve All Recordings.");
            response.setData(recList);
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (Exception ex) {
            // RESPONSE DATA
            response.setSuccess(false);
            response.setMessage("Fail to get All Recordings.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Delete Recording By Id
    @DeleteMapping("/deleteRecordingById/{id}")
    public ResponseEntity<?> deleteRecordingById(@PathVariable Integer id) {
        ResponseStatus response = new ResponseStatus();

        try {
            recRepo.deleteById(id);

            // RESPONSE DATA
            response.setSuccess(true);
            response.setMessage("Recording with Id " + id + " is successfully deleted.");
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (EmptyResultDataAccessException ex) {
            // RESPONSE DATA
            response.setSuccess(false);
            response.setMessage("Fail to delete Recording with Id " + id);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
    }

    // Update Recording's employee
    @PostMapping("/updateRecordingEmployeeById/{rec_id}")
    public ResponseEntity<?> updateEmpNameById(@PathVariable Integer rec_id, @RequestBody String new_emp_id) {
        ResponseStatus response = new ResponseStatus();

        // update recording
        Recording recording = recRepo.findById(rec_id).get();
        Integer old_emp_id = recording.getEmployee().getEmployeeId();

        // update num calls handled
        Employee new_employee = empRepo.findById(Integer.parseInt(new_emp_id)).get();
        // System.out.println("NEW EMP - BEFORE NUM CALLS HANDLED: " +
        // new_employee.getNumCallsHandled());
        new_employee.setNumCallsHandled(new_employee.getNumCallsHandled() + 1);
        // System.out.println("NEW EMP - AFTER NUM CALLS HANDLED: " +
        // new_employee.getNumCallsHandled());

        Employee old_employee = empRepo.findById(old_emp_id).get();
        // System.out.println("OLD EMP - BEFORE NUM CALLS HANDLED: " +
        // old_employee.getNumCallsHandled());
        old_employee.setNumCallsHandled(old_employee.getNumCallsHandled() - 1);
        // System.out.println("OLD EMP - AFTER NUM CALLS HANDLED: " +
        // old_employee.getNumCallsHandled());

        // update recording
        recording.setEmployee(new_employee);

        Recording recObj = recRepo.save(recording);

        // RESPONSE DATA
        response.setSuccess(true);
        response.setMessage("Succesfully change the employee to employee id " + new_emp_id);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("analyzeLambda")
    public ResponseEntity<String> apply(@RequestBody List<Integer> ids) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Account account = accountServiceImpl.loadUserDetailsByUsername(authentication.getName());

            Float limit = account.getPayment().getUsageLimit();
            Float totalUnbilled = usageService.getTotalUnbilledUsage(account.getAccountId());
            Float limitLeft = limit - totalUnbilled;

            boolean check = recordingService.checkLimit(ids, limitLeft, account);

            if (check == false) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Limit Exceeded");
            } else {
                return ResponseEntity.status(HttpStatus.OK).body("Analyze Complete");
            }
        }

        catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Username not Found.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Cannot Process, "
                    + e);
        }
    }

    // @PostMapping("analyzeLambda")
    // @Bean
    // public Function<List<Integer>, ResponseEntity<String>> analyze(@RequestBody
    // List<Integer> ids){
    // return value -> {
    // try {
    // Authentication authentication =
    // SecurityContextHolder.getContext().getAuthentication();
    // Account account =
    // accountServiceImpl.loadUserDetailsByUsername(authentication.getName());

    // Float limit = account.getPayment().getUsageLimit();
    // Float totalUnbilled =
    // usageService.getTotalUnbilledUsage(account.getAccountId());
    // Float limitLeft = limit - totalUnbilled;

    // boolean check = recordingService.checkLimit(ids, limitLeft, account);

    // if(check == false)
    // return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Limit Exceeded");
    // else
    // return ResponseEntity.status(HttpStatus.OK).body("Analyze Complete");
    // }

    // catch (UsernameNotFoundException e){
    // return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Username not
    // Found.");
    // } catch (Exception e) {
    // e.printStackTrace();
    // return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Cannot Process, "+
    // e);
    // }
    // };
    // }
}
