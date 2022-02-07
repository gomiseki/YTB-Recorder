import { useState, useEffect, useRef } from 'react'
import './App.css'
import yt from '../icons/yt.svg'
import record from'../icons/record.svg'
import remove from'../icons/delete.svg'
import stop from'../icons/stop.svg'

const Container = ({children, color}) =>{
    return <div style={{backgroundColor:color}} id='container'>{children}</div>
}

const Mic = ({devices, setDevices}) =>{

    const [micDevice, setMicDevice] = useState('default');

    const onChange = (e) =>{
        setMicDevice(e.target.value)
    }

    useEffect(() => {
        console.log(micDevice);
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id,
                {
                  getDevices:micDevice
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
        })}, [micDevice]);

    if(!devices.ready&&devices.device.length==0){
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
                    {devices.device.map(device=><option value={device.deviceId}>{device.label}</option>)}
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

const Record = ({sound, devices})=>{
    
    //ready, notReady, recording, recorded
    const [playingState, setPlayingState] = useState('ready');
    const [volume, setVolume] = useState({inst:50, voice:50});
    const audioRef = useRef();

    const volumeChange = (e) =>{
        const {value, name} = e.target
        console.log(value)
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(name=='inst'){
                chrome.tabs.sendMessage(tabs[0].id,
                    {
                    inst:value
                    })
            }else{
                chrome.tabs.sendMessage(tabs[0].id,
                    {
                      voice:value
                    })
            }
            })
        setVolume({
            ...volume,
            [name]:value
        })
    }
    const onClick = (e) =>{
        console.log(playingState)
        if(playingState=='ready'){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                
                setTimeout(function(){
                    chrome.tabs.sendMessage(tabs[0].id,
                        {
                        micRedord:'recording start'
                        }    
                    )
                    setPlayingState('recording');
                },100)
            })
        }
        else if(playingState=='recording'){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id,
                    {
                      micRedord:'recording stop'
                    },function(response){
                        setTimeout(() => {
                        response.recording =="success" ? setPlayingState('recorded'):setPlayingState('ready');
                        }, 500);
                    }
                )
            })
        }
        else if(playingState=='recorded'){
            chrome.storage.local.clear(()=> console.log('localstorage cleared'))
            setTimeout(() => {
                setPlayingState('ready');
            }, 3000);
        }
    }

    useEffect(() => {
        if(playingState=='ready'){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if(tabs[0].audible){
                    setPlayingState('notReady');
                }
            })
        }
        else if(playingState=='recorded'){
            chrome.storage.local.get(['recordedAudio'],(result)=>{
                console.log(result)
                audioRef.current.src = result.recordedAudio;
            })
        }   
    }, [playingState]);

    if((sound.ready&&devices.ready)&&(playingState=='ready')){
        return(
            <div id='recordContainer'>
                <p className='state'>💿 Recording</p>
                <div className='message'>
                    <div id='btn'>
                        <button onClick={onClick}><img src={record}/></button>
                    </div>
                    <div id='vol'>
                        <div><p>Instrument</p><input min={0} max={1} step={0.01} value={volume.inst} onChange={volumeChange} type="range" name='inst' /></div>
                        <div><p>Voice</p><input min={0} max={1} step={0.01} value={volume.voice} onChange={volumeChange} type="range" name='voice'/></div>
                    </div>
                </div>
            </div>
        )
    }
    else if((sound.ready&&devices.ready)&&(playingState=="recording")){
        return(
            <div id='recordContainer'>
                <p className='state' style={{color:'gray'}}>💿 Recording...</p>
                <div className='message'>
                    <div id='btn'>
                        <button onClick={onClick}><img src={stop}/></button>
                    </div>
                    <div id='vol'>
                        <pre>녹음 중....</pre>
                    </div>
                </div>
            </div>
        )
    }
    else if((sound.ready&&devices.ready)&&(playingState=="recorded")){
        return(
            <div id='recordContainer'>
                <p className='state' style={{color:'lightgreen'}}>💿 Recording Complete!!</p>
                <div className='message'>
                    <div id='btn'>
                        <button onClick={onClick}><img src={remove}/></button>
                    </div>
                    <div id='vol'>
                        <audio controls ref={audioRef}/>
                    </div>
                </div>
            </div>
        )
    }
    else{
        return( 
            <div id='recordContainer'>
                <p className='state' style={{color:'coral'}}>💿 Recording</p>
                <p className='message'>장치 권한 혹은 정지된 영상이 필요합니다.</p>
            </div>
    )}
}

function App() {

    const [sound, setSound] = useState({ready: false, message:''});
    const [devices, setDevices] = useState({ready: false, device:[]});

    useEffect(() => {
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
            <header><img src={yt} id={'logo'}/><p>Recorder</p></header>
            {sound.ready ?<Container><Sound sound={sound}/><Mic devices={devices} setDevices={setDevices}/><Record sound={sound} devices={devices}/></Container>:<Container color={'lightcoral'}>{'❌  '+ sound.message}</Container>}
            <footer>Copyright 2022 <a target="_blank" href="https://github.com/gomiseki"> @gomiseki</a></footer>
        </div>
    )
}

export default App
