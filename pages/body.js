import { useState, useEffect } from 'react'
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid'

export default function Body() {
  const [jsonObject, setJsonObject] = useState({});
  const [parsedHtml, setParsedHtml] = useState([]);
  const [updatedObject, setUpdatedObject] = useState("");
  const [inputJson, setInputJson] = useState("");
  const [displayJsonEditorBox, setDisplayJsonEditorBox] = useState(false);
  const [displayUploadJsonForm, setDisplayUploadJsonForm] = useState(false);
  const [viewUpdatedJson, setViewUpdatedJson] = useState(false);

  let tempParsedHtml = [];

  const [fetchJsonRequest, setFetchJsonRequest] = useState({
    'endPoint': "https://reqres.in/api/users",
    'headers': ""
  });

  const [uploadJsonRequest, setUploadJsonRequest] = useState({
    'endPoint': "https://reqres.in/api/users",
    'headers': ""
  })

  const objectToJson = (jsonObject) => {
    try {
      return JSON.stringify(jsonObject, null, 3);
    } catch (error) {
      alert("Invalid JSON!");
    }
  }

  const jsonToObject = (json) => {
    try {
      return JSON.parse(json);
    } catch (error) {
      alert("Invalid JSON!");
    }
  }

  const print = () => {
    setUpdatedObject(objectToJson(jsonObject));
  }

  const updateJsonObject = (event) => {
    let name = event.target.name;
    let newValue = event.target.value;
    let path = event.target.dataset.path;

    let pathParts = (path == "" || typeof path == 'undefined') ? [] : path.split(".");

    let updatedObject = jsonObject;
    let targetObject = updatedObject;
    pathParts.forEach((value => {
      targetObject = targetObject[value];
    }));

    targetObject[name] = newValue;

    setJsonObject(jsonObject);
  }

  const generateField = (name, value, path) => {
    // return <div><label className="input-label">{name}</label>&nbsp;:&nbsp;<input className="edit-json-field" type="text" id={path + "." + name} name={name} defaultValue={value} data-path={path} key={value} onChange={updateJsonObject} /></div>
    return <div className="my-1 flex flex-row">
      <label className="json-editor-input-label">{name}</label>
      <span className="px-1">:</span>
      <input className="json-editor-input-field" type="text" id={path + "." + name} name={name} defaultValue={value} data-path={path} key={value} onChange={updateJsonObject} />
    </div>;
  }

  const updatePath = (oldPath, newPathPart) => {
    if (oldPath === "") {
      return newPathPart;
    } else {
      return oldPath + "." + newPathPart;
    }
  }

  const formatJson = (jsonString) => {
    try {
      return objectToJson(jsonToObject(jsonString.replace(/^\s+|\s+$/gm, '')));
    } catch (error) {
      console.log(error);
      alert("Invalid JSON!");
    }
  }

  const formatInputJson = () => {
    if (inputJson != "") {
      setInputJson(formatJson(inputJson));
    }
  }

  const fetchJson = async () => {
    let requestHeaders;
    try {
      requestHeaders = (fetchJsonRequest.headers.trim() == "") ? {} : JSON.parse(fetchJsonRequest.headers);
    } catch (error) {
      console.log(error);
      alert("Invalid Header JSON!");
      return;
    }

    try {
      let res = await fetch(fetchJsonRequest.endPoint, {
        headers: requestHeaders
      });
      let data = await res.json();
      setInputJson(objectToJson(data));
    } catch (error) {
      console.log(error);
      alert("Failed to fetch JSON!");
    }
  }

  const uploadJson = async () => {
    let requestHeaders;
    try {
      requestHeaders = (uploadJsonRequest.headers.trim() == "") ? {} : JSON.parse(uploadJsonRequest.headers);
    } catch (error) {
      console.log(error);
      alert("Invalid Header JSON!");
      return;
    }

    try {
      let res = await fetch(uploadJsonRequest.endPoint, {
        method: 'PUT',
        headers: requestHeaders,
        body: objectToJson(jsonObject)
      });
      let data = await res.json();
      alert(data);
    } catch (error) {
      console.log(error);
      alert("Failed to upload JSON!");
    }
  }

  const toggleCollapse = (event) => {
    let collapsableElement = document.getElementById(event.target.dataset.id);

    if (collapsableElement.classList.contains('hidden')) {
      collapsableElement.classList.remove('hidden');
      event.target.innerText = "-";
    } else {
      collapsableElement.classList.add('hidden');
      event.target.innerText = "+";
    }
  }

  const parseObject = (jsonObject, path = "") => {
    let generatedHtml = [];
    let nestedPath = "";
    let colorConfig;

    if (jsonObject != null && typeof jsonObject !== undefined) {
      Object.entries(jsonObject).forEach(([name, value]) => {

        if (Array.isArray(value) === true) {
          // path = updatePath(path, key);
          nestedPath = updatePath(path, name);
          colorConfig = getColorConfiguration(nestedPath);
          console.log(colorConfig);
          generatedHtml.push(
            <div key={nestedPath} className="editor-collapsable" style={colorConfig}>
              <label className="collapse-toggle-group">
                <button className="collapse-toggle-button" data-id={nestedPath} onClick={toggleCollapse}>+</button>
                {name}
              </label>
              <div className="tab-space hidden" id={nestedPath}>{((value.length > 0) ? parseObject(value, nestedPath) : <div>Empty Array</div>)}</div>
            </div>);
        } else if (typeof value === "object") {
          // path = updatePath(path, key);
          nestedPath = updatePath(path, name);
          colorConfig = getColorConfiguration(nestedPath);
          console.log(colorConfig);
          generatedHtml.push(
            <div key={nestedPath} className="editor-collapsable" style={colorConfig}>
              <label className="collapse-toggle-group">
                <button className="collapse-toggle-button" data-id={nestedPath} onClick={toggleCollapse}>+</button>
                {name}
              </label>
              <div className="tab-space hidden" id={nestedPath}>{parseObject(value, nestedPath)}</div>
            </div>);
        } else {
          generatedHtml.push(generateField(name, value, path));
        }
      });
    } else {
      generatedHtml.push(<div>Object not defined</div>)
    }

    return generatedHtml;
  }

  const updateInput = (event) => {
    setInputJson(event.target.value);
  }

  const updateFetchJsonRequest = (event) => {
    setFetchJsonRequest({ ...fetchJsonRequest, [event.target.name]: event.target.value });
  }

  const updateUploadJsonRequest = (event) => {
    setUploadJsonRequest({ ...uploadJsonRequest, [event.target.name]: event.target.value });
  }

  useEffect(() => {
    if (jsonObject != null && typeof jsonObject !== undefined) {
      tempParsedHtml = parseObject(jsonObject);
      setParsedHtml(tempParsedHtml);
    }
  }, [jsonObject])

  const processJson = () => {
    if (inputJson == "") {
      setJsonObject(jsonToObject("{}"));
    } else {
      setJsonObject(jsonToObject(inputJson));
    }
    setDisplayJsonEditorBox(true);
  }

  const getColorConfiguration = (path) => {
    let pathParts = (path == "" || typeof path == 'undefined') ? [] : path.split(".");
    let colorIndex = pathParts.length;

    let colorArr = [
      {
        "borderColor": "#fb7185",
        // "color": "#fb7185",
        // "background-color": "#fff1f2"
      },
      {
        "borderColor": "#f472b6",
        // "color": "#f472b6",
        // "background-color": "#fdf2f8"
      },
      {
        "borderColor": "#e879f9",
        // "color": "#e879f9",
        // "background-color": "#fdf4ff"
      },
      {
        "borderColor": "#c084fc",
        // "color": "#c084fc",
        // "background-color": "#faf5ff"
      }
    ]
    return colorArr[colorIndex % colorArr.length];

  }

  return (
    <div className="flex justify-center">
      <div className="responsive-width">
        <div className="flex md:flex-row flex-col h-[90vh]">
          <div className="grow py-5 flex flex-col h-full md:w-[40vw] w-full">
            <div className="flex">
              <textarea className="input-json-box" name="json-input" value={inputJson} onChange={updateInput} placeholder="Paste your JSON" />              
            </div>
            <div className="md:text-left text-center">
              <button className="button-green" onClick={formatInputJson}>Format JSON</button>
            </div>
            <div className="pb-4">
              <h2 className="text-center">OR</h2>
            </div>
            <div className="flex flex-col px-5 py-3 bg-white rounded-md drop-shadow-md">
              <div className="text-sm w-full text-center font-bold">
                Fetch JSON using API
              </div>
              <div className="input-group">
                <label className="input-label">EndPoint</label>
                <input type="text" className="input-text" name="endPoint" defaultValue={fetchJsonRequest.endPoint} onChange={updateFetchJsonRequest} placeholder="https://jsoneditor.com/json" />
              </div>
              <div className="input-group">
                <label className="input-label">Headers</label>
                <textarea className="input-textarea" name="headers" defaultValue={fetchJsonRequest.headers} onChange={updateFetchJsonRequest} placeholder="Headers Json" />
              </div>
              <div className="input-group self-center">
                <button className="button-green w-[70px]" onClick={fetchJson}>Fetch</button>
              </div>
            </div>
          </div>

          <div className="px-1 py-5 md:w-[10vh] w-full grow relative flex justify-center">
            <div className="h-full border-l-2 border-slate-400"></div>
            <div className="absolute h-full top-0 flex flex-col justify-center">
              <button className="button-green" onClick={processJson}><ArrowPathRoundedSquareIcon className="w-[20px] h-[25px]" /></button>
            </div>
          </div>

          <div className="grow py-5 md:w-[40vw] w-full">
            <div className="output-json-editor-box" style={getColorConfiguration("")} hidden={viewUpdatedJson}>
              {parsedHtml}
            </div>
            <div className="flex">
              <textarea className="output-json-view-box" hidden={!viewUpdatedJson} value={objectToJson(jsonObject)} readOnly></textarea>
            </div>
            <div className="md:text-right text-center pb-10">
              <button className="button-green" onClick={() => setViewUpdatedJson(true)} hidden={viewUpdatedJson}>View JSON Format</button>
              <button className="button-green" onClick={() => setViewUpdatedJson(false)} hidden={!viewUpdatedJson}>Switch to editor mode</button>
            </div>
            <div className="flex flex-col px-5 py-3 bg-white rounded-md drop-shadow-md">
              <div className="text-sm w-full text-center font-bold">
                Upload updated JSON using API
              </div>
              <div className="input-group">
                <label className="input-label">EndPoint</label>
                <input type="text" className="input-text" name="endPoint" defaultValue={uploadJsonRequest.endPoint} onChange={updateUploadJsonRequest} placeholder="https://jsoneditor.com/json" />
              </div>
              <div className="input-group">
                <label className="input-label">Headers</label>
                <textarea className="input-textarea" name="headers" defaultValue={uploadJsonRequest.headers} onChange={updateUploadJsonRequest} placeholder="Headers Json" />
              </div>
              <div className="input-group self-center">
                <button className="button-green w-[70px]" onClick={uploadJson}>Upload</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    /**<div className="container">
      <div className="text-center">
        <textarea className="input-box" name="json-input" value={inputJson} onChange={updateInput} placeholder="Paste your JSON"/>
        <div>
          <button onClick={formatInputJson}>Format JSON</button>
        </div>
      </div>
      <div className="text-center">
        <b className="text-red-500">OR</b><br/><br/>
        <div>Fetch Using API</div>
        <div>
          <div>
            <input type="text" className="endpoint-box" name="endPoint" defaultValue={fetchJsonRequest.endPoint} onChange={updateFetchJsonRequest} placeholder="https://jsoneditor.com/json" />
          </div>
          <div>
            <textarea className="endpoint-box" name="headers" defaultValue={fetchJsonRequest.headers} onChange={updateFetchJsonRequest} placeholder="Headers Json" />
          </div>
          <div>
            <button onClick={fetchJson}>Fetch</button>
          </div>         
        </div>
      </div>
      <div>
        <button onClick={processJson}>Process</button>
      </div>
      <div hidden={!displayJsonEditorBox}>
        <div className="output-box border-box">
          {parsedHtml}
        </div>
        <div className="text-center">
          <button onClick={print}>Generate Json</button>
          <button onClick={() => setDisplayUploadJsonForm(true)}>Post JSON using API</button>
        </div>
      </div>
      <div hidden={!displayUploadJsonForm}>
        <div>
          <input type="text" className="endpoint-box" name="endPoint" defaultValue={uploadJsonRequest.endPoint} onChange={updateUploadJsonRequest} placeholder="https://jsoneditor.com/json" />
        </div>
        <div>
          <textarea className="endpoint-box" name="headers" defaultValue={uploadJsonRequest.headers} onChange={updateUploadJsonRequest} placeholder="Headers Json" />
        </div>
        <div className="text-center">
          <button onClick={uploadJson}>Upload</button>
        </div>         
      </div>
      <div>
        {updatedObject}
      </div>
    </div>*/
  )

  /**
   * return (
    <div className="container">
      <div className="text-center">
        <textarea className="input-box" name="json-input" value={inputJson} onChange={updateInput} placeholder="Paste your JSON"/>
        <div>
          <button onClick={formatInputJson}>Format JSON</button>
        </div>
      </div>
      <div className="text-center">
        <b className="text-red-500">OR</b><br/><br/>
        <div>Fetch Using API</div>
        <div>
          <div>
            <input type="text" className="endpoint-box" name="endPoint" defaultValue={fetchJsonRequest.endPoint} onChange={updateFetchJsonRequest} placeholder="https://jsoneditor.com/json" />
          </div>
          <div>
            <textarea className="endpoint-box" name="headers" defaultValue={fetchJsonRequest.headers} onChange={updateFetchJsonRequest} placeholder="Headers Json" />
          </div>
          <div>
            <button onClick={fetchJson}>Fetch</button>
          </div>         
        </div>
      </div>
      <div>
        <button onClick={processJson}>Process</button>
      </div>
      <div hidden={!displayJsonEditorBox}>
        <div className="output-box border-box">
          {parsedHtml}
        </div>
        <div className="text-center">
          <button onClick={print}>Generate Json</button>
          <button onClick={() => setDisplayUploadJsonForm(true)}>Post JSON using API</button>
        </div>
      </div>
      <div hidden={!displayUploadJsonForm}>
        <div>
          <input type="text" className="endpoint-box" name="endPoint" defaultValue={uploadJsonRequest.endPoint} onChange={updateUploadJsonRequest} placeholder="https://jsoneditor.com/json" />
        </div>
        <div>
          <textarea className="endpoint-box" name="headers" defaultValue={uploadJsonRequest.headers} onChange={updateUploadJsonRequest} placeholder="Headers Json" />
        </div>
        <div className="text-center">
          <button onClick={uploadJson}>Upload</button>
        </div>         
      </div>
      <div>
        {updatedObject}
      </div>
    </div>
  )
   */
}
