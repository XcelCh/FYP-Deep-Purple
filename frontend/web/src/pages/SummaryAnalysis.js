import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Duration, Inquiries, Complaints, Warranties, PositiveRectangle, NegativeRectangle, Heart, RedHeart } from "../assets/index";
import randomColor from 'randomcolor';
import authHeader from "../services/auth-header";
import { 
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  DoughnutController,
  ArcElement,
  Legend,
  Title,
  PointElement,
  LineController,
  LineElement
} from "chart.js";

import { Bar } from 'react-chartjs-2';
import { BASE_URL } from "./config";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  ArcElement,
  Legend,
  Title,
  PointElement,
  LineController,
  LineElement
)

function SummaryAnalysis() {
  const navigate = useNavigate();
  const token = authHeader();

  const [analysisForm, setAnalysisForm] = useState({

    averageCallDuration : 0.00,
    inquiry : 0,
    complaint : 0, 
    warranty : 0,
    positiveRecSentiment : 0,
    negativeRecSentiment : 0,
    positiveEmpSentiment : 0,
    negativeEmpSentiment : 0,
    suggestion: ''
  })

  
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [sortedCallsHandled, setSortedCallsHandled] = useState([]);
  const employeeDetail = [];
  console.log(analysisForm);

  if (employeeDetails.length > 0) {
    console.log(employeeDetails[0].employeeName);
  }

  // const [mostMentionedData, setMostMentionedData] = useState({
  //   labels: [],
  //   datasets: []
  // });

  // const mostMentionedOptions = {
  //     indexAxis: "y",
  //     plugins: {
  //         legend: {
  //           display: false, // Set to false to hide the legend
  //         },
  //     },
  //     scales: {
  //         x: {
  //           grid: {
  //             display: false, // Set to false to hide the vertical grid lines
  //           }
  //         },
  //         y: {
  //           grid: {
  //             display: false, // Set to false to hide the vertical grid lines
  //           }
  //         },
  //     },
  // }

  const calculateTime = (secs) => {
    if (isNaN(secs) || secs === 0) {
      return 'No calls';
    }
    if(secs < 60) {
        return `${secs} ${secs === 1 ? 'second' : 'seconds'}`;
    } else {
        const minutes = Math.floor(secs / 60);
        const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;  
        const seconds = Math.floor(secs % 60);
        if(seconds === 0) {
            return `${returnedMinutes} ${minutes > 1 ? 'minutes ' : 'minute '}`;
        }
        const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${returnedMinutes} ${minutes > 1 ? 'minutes ' : 'minute '} ${returnedSeconds} ${seconds === 1 ? 'second' : 'seconds'}`;
    }
  }

  const countToPercentage = (num, otherHalf) => {
    const totalCount = num + otherHalf;
    // console.log(Math.round(num / totalCount * 100));
    return Math.round(num / totalCount * 100);
  }

  const [summaryAnalysisData, setSummaryAnalysisData] = useState([]);
  // const [topSentimentOption, setTopSentimentOption] = useState('Positive');
  const [randomColors, setRandomColors] = useState([]);
  const [employeeName, setEmployeeName] = useState(0);
  const [employeeKey, setEmployeeKey] = useState(0);
  const [employeeNames, setEmployeeNames] = useState([]);
  const [employeePerformances, setEmployeePerformances] = useState([]);
  // const [employeeSentiment, setEmployeeSentiment] = useState({
  //   sentimentCount: [],
  //   sentimentPercentage: [],
  //   sentimentCategory: ''
  // });

  // const [totalTime, setTotalTime] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);

  useEffect (() => {

      var totalDuration = 0;
      var totalCalls = 0;

      console.log(employeeDetails);

      for (var x = 0 ; x < employeeDetails.length; x++) {
        console.log(x);
        totalCalls += employeeDetails[x].numberOfCalls;
        totalDuration += employeeDetails[x].totalDuration;
      }

      setTotalCalls(totalCalls);
      // setTotalTime(totalDuration);

    }, [employeeDetails])

  useEffect( () => {
    window.scrollTo(0, 0);
     fetch(`${BASE_URL}/summaryAnalysis/getAnalysis`, {
      headers : token
    })
      .then(response => {
          // error unauthorized
          if (response.status == 401) {
              navigate("/");
              console.log("401 Unauthorized");
          }
          else if (response.status == 200) {
              console.log("Success");
              return response.json();
          }
      })
      .then(data => {
          console.log(data);
          setEmployeeNames(data.employeeList.map(employee => employee.employeeName));
          setEmployeePerformances(data.employeeList.map(employee => employee.employeeAvgPerformance));
          setAnalysisForm({
            averageCallDuration : data.averageCallDuration,
            inquiry : data.inquiry,
            complaint : data.complaint, 
            warranty : data.warranty,
            positiveRecSentiment : data.positiveRecSentiment,
            negativeRecSentiment : data.negativeRecSentiment,
            positiveEmpSentiment : data.positiveEmpSentiment,
            negativeEmpSentiment : data.negativeEmpSentiment,
            suggestion: data.suggestion

          })

          const sorted = [...data.employeeList].sort((a, b) => b.numberOfCalls - a.numberOfCalls);
          setSortedCallsHandled(sorted);
          // console.log(data.employeeList.length);
          for(let x = 0; x < data.employeeList.length; x++) {
            // const emp = data.employeeList[x];
            employeeDetail.push(data.employeeList[x]);
            // setEmployeeDetails(prev => [...prev, emp]);
            // console.log(x);
            console.log(employeeDetail[0]);
          }

          setEmployeeDetails(employeeDetail);
      })
      .catch(error => {
          console.error(error);
      })

  }, []);

  useEffect(() => {
    if (analysisForm.averageCallDuration === 0) {
      // Data is not available yet, skip rendering the chart
      return;
    }

    if (employeeDetails.length > 0) {
      const colors = employeeDetails.map(randomColor);
      setRandomColors(colors);
    }

    // Chart data
    const dataDoughnut = {
      labels: ["Positive", "Negative"],
      datasets: [
        {
          label: "Number of calls",
          data: [analysisForm.positiveRecSentiment, analysisForm.negativeRecSentiment],
          backgroundColor: [
            "#80F2AA",
            "#EE5B3D",
          ],
          hoverOffset: 4,
        },
      ],
    };

    // Chart configuration
    const configDoughnut = {
      type: "doughnut",
      data: dataDoughnut,
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    };

    const canvas = document.getElementById("chartDoughnut");
    // Destroy any existing chart instance on the canvas
    if (canvas.chart) {
      canvas.chart.destroy();
    }
    // Render the doughnut chart
    canvas.chart = new ChartJS(canvas, configDoughnut);

  }, [employeeDetails])

  const handleEmployeeSentiment = (employee) => {
    setEmployeeName(employee);

    for (var x = 0; x < employeeDetails.length; x++) {
      if(employeeDetails[x].employeeName === employee) {
        setEmployeeKey(x);
      }
    }

  }

  const employeePerformanceData = {
    labels: employeeNames,
    datasets: [
      {
        data: employeePerformances,
        backgroundColor: randomColors,
        borderWidth: 0,
      },
    ],
  };

  const employeePerformanceOptions = {
    plugins: {
      legend: {
        display: false, // Set to false to hide the legend
      }
    },
    scales: {
      x: {
        grid: {
          display: false, // Set to false to hide the vertical grid lines
        },
      },
      y: {
        min: Math.round(Math.min(...employeePerformances) - 1),
        max: Math.round(Math.max(...employeePerformances) + 1),
      },
    },
  };

  return (
    <>
    {/* {(employeeDetails.length > 0) ? ( */}
      <div className="pt-16 pl-16">
        <div className="flex items-center">
          <p className="text-2xl font-bold text-left ml-4">Analysis Summary</p>
        </div>

        {/* Categories card */}
        <div className="grid w-full gap-8 grid-cols-4 mt-4 px-4">
          <div className="border p-4 rounded-md">
            <div className="flex items-center">
              <div className="w-3/4 flex flex-col ml-2 h-1/2 justify-center">
                  <div className="flex-grow font-semibold text-md">
                      Average Call Duration
                  </div>
                  <div className="flex-grow font-bold text-md mt-2">
                      {calculateTime(analysisForm.averageCallDuration)}
                  </div>
              </div>
              <div className="w-1/4 flex flex-col items-center">
                <img src={Duration} />
              </div>
            </div>
          </div>
          <div className="border p-4 rounded-md">
            <div className="flex items-center">
              <div className="w-3/4 flex flex-col ml-2 h-1/2 justify-center">
                  <div className="flex-grow font-semibold text-md">
                      Number of Inquiries
                  </div>
                  <div className="flex-grow font-bold text-xl mt-2">
                      {analysisForm.inquiry}
                  </div>
              </div>
              <div className="w-1/4 flex flex-col items-center">
                <img src={Inquiries} />
              </div>
            </div>
          </div>
          <div className="border p-4 rounded-md">
            <div className="flex items-center">
              <div className="w-3/4 flex flex-col ml-2 h-1/2 justify-center">
                  <div className="flex-grow font-semibold text-md">
                      Number of Complaints
                  </div>
                  <div className="flex-grow font-bold text-xl mt-2">
                      {analysisForm.complaint}
                  </div>
              </div>
              <div className="w-1/4 flex flex-col items-center">
                <img src={Complaints} />
              </div>
            </div>
          </div>
          <div className="border p-4 rounded-md">
            <div className="flex items-center">
              <div className="w-3/4 flex flex-col ml-2 h-1/2 justify-center">
                  <div className="flex-grow font-semibold text-md">
                      Number of Warranties
                  </div>
                  <div className="flex-grow font-bold text-xl mt-2">
                      {analysisForm.warranty}
                  </div>
              </div>
              <div className="w-1/4 flex flex-col items-center">
                <img src={Warranties} />
              </div>
            </div>
          </div>
        </div>

        {/* Second row */}
        <div className="grid w-full gap-4 grid-cols-3 mt-4 px-4">
          {/* Num of call sentiments */}
          <div className="flex items-center col-span-1 border rounded-md p-8">
            <div className="w-1/3 flex flex-col mr-4">
              <div className="rounded-lg overflow-hidden" style={{ width: '150px', height: '150px' }}>
                <canvas id="chartDoughnut"></canvas>
              </div>
            </div>
            <div className="w-2/3 flex flex-col ml-8 justify-center">
              <div className="flex-grow font-bold text-lg">
                Number of Call Sentiments
              </div>
              <div className="flex flex-grow font-medium mt-2">
                <img src={PositiveRectangle} />
                <p className="ml-2">{countToPercentage(analysisForm.positiveRecSentiment, analysisForm.negativeRecSentiment)}% Positive ({analysisForm.positiveRecSentiment})</p>
              </div>
              <div className="flex flex-grow font-medium">
                <img src={NegativeRectangle} />
                <p className="ml-2">{countToPercentage(analysisForm.negativeRecSentiment, analysisForm.positiveRecSentiment)}% Negative ({analysisForm.negativeRecSentiment})</p>
              </div>
            </div>
          </div>

          <div className="flex col-span-2 border rounded-md p-4">
            {/* Top 5 employee */}
            <div className="w-2/5 h-1/2">
              <div className="flex h-1/3 items-center mb-2">
                <div className="flex-grow font-bold text-md">
                  Top 5 Employee Based On Performance
                </div>
                <div className="relative w-2/5">
                  {/* <select 
                      className="bg-gray-50 block appearance-none border border-gray-400 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5 h-full px-2" 
                      id="grid-state"
                      value={topSentimentOption}
                      onChange={(event) => setTopSentimentOption(event.target.value)}
                  >
                      <option value="Positive">Positive</option>
                      <option value="Negative">Negative</option>
                  </select> */}
                  {/* <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div> */}
                </div>
              </div>
              <div className="relative">
                <table className="w-full text-sm text-left text-gray-500 border border-[#83848A]">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-[#83848A]">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            No
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Employee name
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Avg Performance
                        </th>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {employeeDetails.slice(0, 5).map((employee, index) => (
                        <tr className="bg-[#80F2AA] border-b border-[#83848A]">
                          <th scope="row" className="px-6 py-2 font-medium text-black whitespace-nowrap">
                              {index+1}
                          </th>
                          <td className="px-6 py-2 text-black">
                              {employee.employeeName}
                          </td>
                          <td className="px-6 py-2 text-black">
                              {employee.employeeAvgPerformance}
                          </td>
                        </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Employee's sentiment */}
            <div className="w-3/5 border-l ml-4">
              <div className="flex h-1/3 px-4 items-center">
                <div className="flex-grow font-bold text-lg">
                  Employee's Sentiment
                </div>
                <div className="relative w-1/3">
                  <select 
                      className="bg-gray-50 block appearance-none border border-gray-400 text-gray-900 sm:text-sm rounded-lg w-full p-2.5 focus:ring-indigo-600 focus:border-indigo-600 block px-2" 
                      id="grid-state"
                      value={employeeName}
                      onChange={(event) => handleEmployeeSentiment(event.target.value)}
                  >
                    {employeeDetails.map((employee, index) => (
                      <option key={index} value={employee.employeeName}>
                        {employee.employeeName}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                
                {employeeDetails.length > 0 && (
                  employeeDetails[employeeKey].positiveEmpSentiment !== 0 || employeeDetails[employeeKey].negativeEmpSentiment !== 0 ? (
                    <div className="grid grid-cols-3">
                      <div className="flex flex-col items-center col-span-1">
                        <div className="flex items-center">
                          <img src={countToPercentage(employeeDetails[employeeKey].positiveEmpSentiment, employeeDetails[employeeKey].negativeEmpSentiment) > 49 ? Heart : RedHeart} />
                          <p className={`text-3xl font-bold ${countToPercentage(employeeDetails[employeeKey].positiveEmpSentiment, employeeDetails[employeeKey].negativeEmpSentiment) > 49 ?  "text-[#80F2AA]" : "text-[#EE5B3D]"}`}>
                            {[countToPercentage(employeeDetails[employeeKey].positiveEmpSentiment, employeeDetails[employeeKey].negativeEmpSentiment)]}%
                          </p>
                        </div>
                        <p className="text-xl font-medium">{countToPercentage(employeeDetails[employeeKey].positiveEmpSentiment, employeeDetails[employeeKey].negativeEmpSentiment) > 49 ? "High" : "Low"}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center col-span-2">
                        <div className="relative w-full">
                          <div className="flex items-center justify-between font-medium">
                            <div className="text-[#80F2AA]">{employeeDetails[employeeKey].positiveEmpSentiment} ({countToPercentage(employeeDetails[employeeKey].positiveEmpSentiment, employeeDetails[employeeKey].negativeEmpSentiment)}%)</div>
                            <div className="text-[#EE5B3D]">{employeeDetails[employeeKey].negativeEmpSentiment} ({countToPercentage(employeeDetails[employeeKey].negativeEmpSentiment, employeeDetails[employeeKey].positiveEmpSentiment)}%)</div>
                          </div>
                          <div className="flex h-3 overflow-hidden rounded-xl bg-[#EE5B3D] text-xs">
                            <div style={{ width: `${countToPercentage(employeeDetails[employeeKey].positiveEmpSentiment, employeeDetails[employeeKey].negativeEmpSentiment)}%` }} className="bg-[#80F2AA]"></div>
                          </div>
                          <div className="flex items-center justify-between font-medium">
                            <div className="text-[#80F2AA]">Positive</div>
                            <div className="text-[#EE5B3D]">Negative</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center mt-8 text-lg">Employee does not have any recordings yet</p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Third row */}
        <div className="grid w-full gap-4 grid-cols-2 mt-4 px-4">
          <div className="border rounded-md p-8">
            <p className="font-bold text-xl mb-4">Average Employee Performance</p>
            <div className="rounded-lg overflow-hidden">
              <Bar
                style={{
                  padding: "10px",
                }}
                data={employeePerformanceData}
                options={employeePerformanceOptions}
              ></Bar>
            </div>
          </div>

          {/* Number of calls handled */}
          <div className="border rounded-md p-8">
            <p className="font-bold text-xl mb-4">Number of Calls Handled</p>
            <div className="overflow-y-scroll h-96 pr-4">
              {sortedCallsHandled.map((employee, index) => (
                <div className="mb-4">
                  <p className="font-semibold">{employee.employeeName}</p>
                  <div className="relative w-full">
                    <div className="flex items-center justify-between">
                      <div className="text-[#83848A]">Average session: {calculateTime(employee.totalDuration/employee.numberOfCalls)}</div>
                      <div className="text-[#83848A]">{employee.numberOfCalls} of {totalCalls} calls</div>
                    </div>
                    {/* Bar */}
                    <div className="mb-5 h-3 rounded-full bg-[#F5F5F5]">
                      <div className="h-3 rounded-full" style={{ width: `${countToPercentage(employee.numberOfCalls, totalCalls - employee.numberOfCalls)}%`, backgroundColor: randomColors[index] }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fourth row */}
        <div className="px-4">
          <div className="grid w-full mt-4 border rounded rounded-md">
            <div className="p-8 border-r">
              <p className="font-bold text-xl mb-4">Improvement Suggestions</p>
              <p style={{ textAlign: 'justify' }}>{analysisForm.suggestion}</p>
            </div>
            {/* <div className="grid grid-rows-2 col-span-1 p-8">
              <div className="border-b">
                <p className="font-bold text-xl mb-4">Negative Word Cloud</p>
                <div className="flex items-center justify-center">
                  <ul class="flex justify-center flex-wrap max-w-xl align-center gap-2 leading-8">
                    <li><a class="text-3xl text-cyan-500">Country Names</a></li>
                    <li><a class="text-xl text-teal-500">Chemistry</a></li>
                    <li><a class="text-md text-red-500">File Type</a></li>
                    <li><a class="text-lg text-green-500">Cryptocurrency</a></li>
                    <li><a class="text-sm text-orange-500">Academic</a></li>
                    <li><a class="text-3xl text-cyan-500">Softwares</a></li>
                    <li><a class="text-md text-blue-500">General</a></li>
                    <li><a class="text-2xl text-indigo-500">Web Technology</a></li>
                    <li><a class="text-xl text-indigo-500">Business</a></li>
                    <li><a class="text-md text-blue-500">Technology</a></li>
                    <li><a class="text-xs text-cyan-500">Sports</a></li>
                    <li><a class="text-4xl text-red-500">Law</a></li>
                    <li><a class="text-lg text-gray-500">Internet Slangs</a></li>
                    <li><a class="text-3xl text-cyan-500">Insurance</a></li>
                    <li><a class="text-md text-blue-500">Space Science</a></li>
                    <li><a class="text-4xl text-red-500">Jobs</a></li>
                    <li><a class="text-lg text-gray-500">Certifications</a></li>
                    <li><a class="text-sm text-orange-500">Electronics</a></li>
                  </ul>
                </div>
              </div>
              <div>
                <p className="font-bold text-xl mt-4">5 Most Mentioned Words</p>
                <div className="flex items-center justify-center">
                  <div style={{ width: '500px', height: '250px'}}>
                    <Bar
                      data = {mostMentionedData}
                      options = {mostMentionedOptions}    
                    ></Bar>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    {/* ) : null} */}
    </>
  );
}

export default SummaryAnalysis;
