import logo from './logo.svg';
import './App.css';
import { useState,useRef } from "react";
import axios from "axios";


function App() {

  const [segmentOptions, setSegment] = useState([
      {"Label":"First Name","Value":"first_name","Added":false,"traitType":1},
      {"Label":"Last Name","Value":"last_name","Added":false,"traitType":1},
      {"Label":"Gender","Value":"gender","Added":false,"traitType":2},
      {"Label":"Age","Value":"age","Added":false,"traitType":2},
      {"Label":"Account Name","Value":"account_name","Added":false,"traitType":2},
      {"Label":"City","Value":"city","Added":false,"traitType":1},
      {"Label":"State","Value":"state","Added":false,"traitType":1},
  ]);

  const [displayAlert,setAlert] = useState(false)
  const [alertMessage,setMessage] = useState("Either select or remove schema")
  const [toggleModal,openModal] = useState(false)

  const [sampleValues, setSamples] = useState({
    "first_name":"Anand",
    "last_name":"Prakash",
    "gender":"Male",
    "age":24,
    "account_name":"Admin",
    "city":"Chennai",
    "state":"Tamil Nadu",
  })

  const addSegmentRef = useRef("")
  const segmentName = useRef("")

  const alterSegments = (optionValue,optionAdded) => {
    let tempOption = segmentOptions
    tempOption.filter(segment => (segment.Value==optionValue) ).forEach(segment => {
      segment.Added = optionAdded
    })

    setSegment([...tempOption])
  }

  const resetSegments = () => {
    let tempOption = segmentOptions
    tempOption.forEach(segment => {
      segment.Added = false
    })

    setSegment([...tempOption])
  }


  const addSegmentButton = () => {
    let selectedAddSegment = addSegmentRef.current.value
    //console.log("Current Add Value:",selectedAddSegment)
    if(selectedAddSegment=="-999"){
        setMessage("Either select or remove schema")
        setAlert(true)
        setTimeout(function(){
          setAlert(false)
        },5000);
    }else{
      alterSegments(selectedAddSegment,true)
      addSegmentRef.current.value = "-999"
    }
  }

  const removeSegment = (selectedSegment) => {
    alterSegments(selectedSegment,false)
    addSegmentRef.current.value = "-999" 
  }

  const replaceSegment = (event,prevValue) => {
    let nextValue = event.target.value
    if(prevValue!=nextValue){
      alterSegments(prevValue,false)
      alterSegments(nextValue,true)
      addSegmentRef.current.value = "-999" 
    }
  }

  const displayBlueBox = () => {
    let segmentLength = segmentOptions.filter ( segment => (segment.Added==true)).length
    return segmentLength>0?'form-group blue-box':'d-none'
  }

  const resetAll = () => {
    segmentName.current.value = ""
    addSegmentRef.current.value = "-999" 
    setAlert(false)
    setMessage("Either select or remove schema")
    resetSegments()
  }

  const sendDataServer = () => {

    let nameSegment = segmentName.current.value;

    let postData = {}
    let addedSegments = segmentOptions.filter( segment => (segment.Added == true) )

    if(nameSegment=="" || addedSegments.length<=0){
      setMessage("Segment Name or schema shouldnt be empty")
      setAlert(true)
      setTimeout(() => {
        setAlert(false)
      }, 4000);
      return;
    }else{
      let schemaArray = []
      addedSegments.forEach( segment => {
        let tempObj = {}
        tempObj[segment.Value] = sampleValues[segment.Value]
        schemaArray.push(tempObj)
      } )
      postData["segment_name"] = nameSegment
      postData["schema"] = schemaArray
    }

    let baseURL = "https://webhook.site/6fe57e27-f694-4952-a37b-6b3c95fd555e"

    axios
      .post(baseURL, postData)
      .then((response) => {
        console.log("response:",response)
        setMessage("Segment Saved Successfully")
        setAlert(true)
        setTimeout(() => {
          setAlert(false)
          resetAll();
        }, 4000);
      });

  }

  const switchModal = (toggleValue) => {
    openModal(toggleValue);
    resetAll();
  }

  return (
    <div className="App">
      <div className='container-fluid'>
        <div className='row'>
          <div className={toggleModal?'col-7 p-0':'col-12 p-0'}>
            <nav className="navbar navbar-light bg-info">
              <span className="navbar-text text-white font-weight-bold">
                &#11139; View Audience
              </span>
            </nav>
            <div className='container'>
              <button type="button" onClick={()=>{switchModal(!toggleModal)}} className="btn btn-primary m-5" data-toggle="modal" data-target="#exampleModal">
              Save Segment
              </button>
            </div>
          </div>
          <div className={toggleModal?'col-5 p-0':'d-none'} style={{zIndex:1,borderLeft:"black 1px solid"}}>
            <nav className="navbar navbar-light bg-info">
              <span onClick={()=>{switchModal(false)}} className="navbar-text text-white font-weight-bold">
                &#11139; Saving Segment
              </span>
            </nav>
            <div className='container'>
              <form className='my-3'>
                <div className="form-group">
                  <label className='w-100 text-left' htmlFor="formGroupExampleInput">Enter the Name of the Segment</label>
                  <input ref={segmentName} type="text" className="form-control" id="formGroupExampleInput" placeholder="Name of the segment" />
                  <label className='w-100 text-left mt-2' htmlFor="formGroupExampleInput2">To save your segment, you need to add the schemas to build the query</label>
                  <p className='legend-desc'> <span className='trait-user mx-1'>&#x2022;</span> User Traits <span className='trait-group mx-1'>&#x2022;</span> Group Traits </p>
                </div>
                <div className={displayBlueBox()}>
                  {segmentOptions.filter( segment => (segment.Added==true) ).map((segments,index) => (
                    <div key = {segments.Value} className='d-flex justify-content-around align-self-center align-items-center'>
                      <span className={segments.traitType==1?'trait-user p-2':"trait-group p-2"}>&#x2022;</span>
                      <select className="custom-select mx-2" onChange={ (e) => {replaceSegment(e,segments.Value)}}>
                        <option value={segments.Value} defaultValue={true}>{segments.Label}</option>
                        {
                          segmentOptions.filter(segment => (segment.Added==false)).map( (segments,index) => (
                            <option key = {index} value={segments.Value}>{segments.Label}</option>
                          ))
                        }
                      </select>
                      <button type="button" className="btn btn-outline-secondary font-weight-bold" onClick={()=>{removeSegment(segments.Value)}}>&#8212;</button>
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <select className="custom-select" id="formGroupExampleInput2" ref={addSegmentRef}>
                    <option value="-999" defaultValue={true}>Add schema to segment</option>
                    {
                      segmentOptions.filter(segment => (segment.Added==false)).map( (segments,index) => (
                        <option key = {index} value={segments.Value}>{segments.Label}</option>
                      ))
                    
                    }
                  </select>
                </div>
                <div className={displayAlert?"alert alert-info":"d-none"} role="alert">
                  {alertMessage}
                </div>
                <div className="position-relative text-left">
                  <a className="mr-2 stretched-link" onClick={()=>{addSegmentButton()}}>+ <u>Add new schema</u></a>
                </div>
              </form>
            </div>
            <div className="footer d-flex align-items-center bg-light py-2">
              <div className='my-2'>
                <button type="button" onClick={() => {sendDataServer()}} className="btn btn-success mx-2">Save the Segment</button>
                <button type="button" onClick={()=>{switchModal(false)}} className="btn btn-danger cancelBtn mx-2" data-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
