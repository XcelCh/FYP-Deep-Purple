import React, { useState } from "react";
import Datepicker from "tailwind-datepicker-react";
import { LeftArrow, RightArrow } from "../assets";

const options = {
  // title: "Demo Title",
  autoHide: true,
  todayBtn: false,
  clearBtn: true,
  maxDate: new Date("2030-01-01"),
  minDate: new Date("1950-01-01"),
  theme: {
    background: "#FFFFFF",
    todayBtn: true,
    clearBtn: "",
    icons: "",
    text: "",
    disabledText: "",
    input: "",
    inputIcon: "",
    selected: "",
  },
  icons: {
    prev: () => (
      <span>
        <img src={LeftArrow}></img>
      </span>
    ),
    next: () => (
      <span>
        <img src={RightArrow}></img>
      </span>
    ),
  },
  datepickerClassNames: "top-12",
  defaultDate: new Date(),
  language: "en",
};

const DatePicker = () => {
  const [show, setShow] = useState(false);

  const handleChange = (selectedDate) => {
    console.log(selectedDate);
  };

  const handleClose = (state) => {
    setShow(state);
  };

  return (
    <div>
      <Datepicker
        options={options}
        onChange={handleChange}
        show={show}
        setShow={handleClose}
      />
    </div>
  );
};

export default DatePicker;