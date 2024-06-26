import React, { useEffect, useState } from 'react';
import SideBar from '../components/SideBar';
import attendanceService from '../services/attendance.service';

const Home = () => {
  const [hamActive, setHamActive] = useState(false);

// pending
const updateEmpAttendance = async () => {
  const data = { 
      workDetails: [
          {
              date: '2024-05-01', // Use a valid date format
              sessionTimeIn: '09:10:13',
              sessionTimeOut: '17:00:00',
              isWorkingRemotely: true 
          }
      ]
  };
  await attendanceService.handleUpdateEmpAttendance('E00M9K5X', data)
      .then((response) => {
          console.log(response);
      })
      .catch((error) => {
          console.log(error);
      });
}
updateEmpAttendance();
// -------------------

  // Clock
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [startDisabled, setStartDisabled] = useState(false);
  const [endDisabled, setEndDisabled] = useState(true);
  const [startSessionWarningModalState, setStartSessionWarningModalState] = useState(false);
  const [endSessionWarningModalState, setEndSessionWarningModalState] = useState(false);

  useEffect(() => {
    const storedTime = localStorage.getItem('time');
    const storedIsRunning = localStorage.getItem('isRunning');
    const storedSessionStarted = localStorage.getItem('sessionStarted');
    const lastSessionDate = localStorage.getItem('lastSessionDate');
    const today = new Date().toISOString().split('T')[0];

    if (storedTime) {
      setTime(parseInt(storedTime, 10));
    }

    if (storedIsRunning === 'true') {
      startStopwatch();
    }

    if (storedSessionStarted === 'true') {
      setSessionStarted(true);
    }

    if (lastSessionDate === today) {
      setStartDisabled(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('time', time);
    localStorage.setItem('isRunning', isRunning);
    localStorage.setItem('sessionStarted', sessionStarted);
  }, [time, isRunning, sessionStarted]);

  const startStopwatch = () => {
    if (!isRunning && !startDisabled) {
      setStartSessionWarningModalState(false)
      setIsRunning(true);
      setSessionStarted(true);
      setStartDisabled(true);
      setEndDisabled(false);
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('lastSessionDate', today);

      const intervalId = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
      setTimer(intervalId);
    }
  };

  const togglePauseResume = () => {
    if (isRunning) {
      clearInterval(timer);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      const intervalId = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
      setTimer(intervalId);
    }
  };

  const endSessionwatch = () => {
    if (!endDisabled) {
      setEndSessionWarningModalState(false)
      clearInterval(timer);
      setIsRunning(false);
      setTime(0);
      setSessionStarted(false);
      setEndDisabled(true);
      localStorage.removeItem('time');
      localStorage.removeItem('isRunning');
      localStorage.removeItem('sessionStarted');
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timer);
    };
  }, [timer]);

  const formatTime = (time) => {
    const getSeconds = `0${(time % 60)}`.slice(-2);
    const minutes = `${Math.floor(time / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(time / 3600)}`.slice(-2);

    return `${getHours} : ${getMinutes} : ${getSeconds}`;
  };

  return (
    <div className='w-full flex justify-between max-sm:flex-col'>
      <div>
        <SideBar hamActive={hamActive} setHamActive={setHamActive} />
      </div>
      <div className={` ${hamActive ? 'w-[75%] max-sm:w-full' : 'w-full'} flex p-3 flex-col items-center`}>
        {/* Buttons */}
        <div className='flex justify-center w-full '>
          <button
            className={` border-2 m-1 p-3 rounded ${startDisabled ? "bg-gray-400" : "bg-main-green hover:bg-green-600"} text-white `}
            onClick={()=>setStartSessionWarningModalState(true)}
            disabled={startDisabled}
          >Start Session
          </button>
          <button
            className={` border-2 m-1 p-3 rounded ${sessionStarted ? (isRunning ? "bg-[#b39c1c] hover:bg-yellow-600" : "bg-main-green hover:bg-green-600") : "bg-gray-400"} text-white `}
            onClick={togglePauseResume}
            disabled={!sessionStarted}
          >{isRunning ? "Pause Session" : "Resume Session"}
          </button>
          <button
            className={` border-2 m-1 p-3 rounded ${endDisabled ? "bg-gray-400" : "bg-[#912f16] hover:bg-red-600"} text-white `}
            onClick={()=>setEndSessionWarningModalState(true)}
            disabled={endDisabled}
          >End Session
          </button>
        </div>

        <div className='w-full h-[80vh] flex justify-center items-center'>
          <div className='relative'>
            <p>Total Work Hrs.</p>
            <h1 className={`text-[800%] max-lg:text-[650%] max-md:text-[550%] max-sm:text-[370%] ${isRunning ? "text-gray-400" : "text-yellow-400"} text-gray-400`}>{formatTime(time)}</h1>
            <p className={`${isRunning ? "hidden" : "block"} text-yellow-400 absolute right-0`}>paused.</p>
          </div>
        </div>
      </div>

      {startSessionWarningModalState && 
      <div className='bg-black bg-opacity-50  w-full h-full absolute z-20 flex justify-center items-center'>
        <div className='bg-white p-4 rounded shadow mx-3'>
          <h1 className='mb-4'>Are you sure you want to Start the session? <br/> You can only Start one session per day</h1>
          <div className='flex justify-end'>
          <button className='py-2 px-4 border-2 mx-2 rounded hover:bg-red-500 hover:text-white' onClick={()=>setStartSessionWarningModalState(false)}>No</button>
          <button className='py-2 px-4 border bg-main-green text-white mx-2 rounded hover:bg-green-500' onClick={startStopwatch}>Start</button>
          </div>
        </div>
      </div>}
      {endSessionWarningModalState && 
      <div className='bg-black bg-opacity-50  w-full h-full absolute z-20 flex justify-center items-center'>
        <div className='bg-white p-4 rounded shadow mx-3'>
          <h1 className='mb-4'>Are you sure you want to End the session?</h1>
          <div className='flex justify-end'>
          <button className='py-2 px-4 border-2 mx-2 rounded hover:bg-red-500 hover:text-white' onClick={()=>setEndSessionWarningModalState(false)}>No</button>
          <button className='py-2 px-4 border bg-main-green text-white mx-2 rounded hover:bg-green-500'onClick={endSessionwatch}>End</button>
          </div>
        </div>
      </div>}

    </div>
  );
}

export default Home;
