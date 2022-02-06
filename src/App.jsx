import { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import yt from '../public/yt.png'

const Container = ({children, color}) =>{
    return <div style={{backgroundColor:color}} id='container'>{children}</div>
}
const Mic = ({mic}) =>{
    const [micDevice, setMicDevice] = useState('default');

    const onChange = (e) =>{
        setMicDevice(e.target.value)
    }

    useEffect(() => {
        if(mic.length!=0){
            chrome.tabs.sendMessage(tabs[0].id,
                {
                    getStream: micDevice
                })
        }
    }, [micDevice]);

    if(mic.length==0){
        return(
            <div className='innerContainer'>
                <p className='state' style={{color:'coral'}}>🎙 Device not found</p>
                <p className='message'>오디오 장치를 찾지 못했습니다ㅠㅠ</p>
            </div>
        )

    }else{
        return(
            <div className='innerContainer'>
                <p className='state'>🎙Device on</p>
                <div className='message'>
                    <select  value={micDevice} onChange={onChange}>
                    {mic.map(device=><option value={device.deviceId}>{device.label}</option>)}
                    </select>
                </div>
            </div>
        )
    }
}

const Sound = ({sound}) =>{
    return(
        <div className='innerContainer'>
            <p className='state'>🎵 Sound on</p>
            <p className='message'>{sound.message}</p>
        </div>
    )
}

const Record = ()=>{
    return(
        <div id='recordContainer'></div>
    )
}
function App() {

    const [devices, setDevices] = useState({ready: false, device:[]});
    const [sound, setSound] = useState({ready: false, message:''});

    useEffect(() => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id,
                {
                  getDevices:'getDevices'
                },
                function(response) {
                    console.log(response)
                    if(response.devices){
                        let deviceArray = response.devices.filter(x=>x.kind=='audioinput');
                        if(deviceArray.length>=1){
                            setDevices({ready:true, device:response.devices.filter(x=>x.kind=='audioinput')})
                        }
                    }
                    else{
                        setDevices({ready: false, device:[]})
                    }
                }
            )
        })
        chrome.tabs.query({active: true,currentWindow: true}, function (tabs) {
          if (tabs[0].url.split('v=')[0]=='https://www.youtube.com/watch?'){
              setSound({ready:true, message:tabs[0].title})
          }
          else{
              setSound({ready:false, message:'유튜브 영상 페이지에서 실행해주세요'})
          }
        })
    return () => {
    };
  }, []);

  return (
    <div className="App">
        <header><img src={yt} alt="" /><p>Recorder</p></header>
        {sound.ready ?<Container><Sound sound={sound}></Sound><Mic mic={devices.device}></Mic><Record></Record></Container>:<Container color={'lightcoral'}>{'❌  '+ sound.message}</Container>}
        <footer>Copyright 2022 <a target="_blank" href="https://github.com/gomiseki"> @gomiseki</a></footer>
    </div>
  )
}

export default App
