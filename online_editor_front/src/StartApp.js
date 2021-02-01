import React from "react";
import './App.css';
import axios from 'axios';
import {Button, TextArea, Icon, Label} from "@blueprintjs/core";
import Cookies from "universal-cookie";

const cookies = new Cookies();

let stateRedactor = {
    state: 0,
    uuid: null
};

function StartApp() {
    if (cookies.get('stateRedactor') === 'undefined' || cookies.get('stateRedactor') == null ){
        cookies.set('stateRedactor', stateRedactor);
    } else {
        stateRedactor = cookies.get('stateRedactor');
    }
    switch (stateRedactor.state) {
        case 0: {
            return <div className="App">
                        <div className="bp3-button App-button" onClick={createRedactor}>
                            <Icon icon="add"/>
                            <div>Создать редактор</div>
                        </div>
                        <div className="bp3-button App-button" onClick={viewRedactor}>
                            <Icon icon="eye-open"/>
                            <div>Подключиться к редактору</div>
                        </div>
                        <div>
                            <input id="inputUUID" className="bp3-input bp3-round bp3-large App-input" type="text" placeholder="uuid" dir="auto" />
                        </div>
                    </div>;
        }
        case 1: {
            return <div className="App">
                        <div><p>uuid: {stateRedactor.uuid}</p></div>
                        <TextArea className="bp3-input bp3-fill App-textArea" dir="auto" onChange={onInputChange} />
                    </div>;
        }
        case 2: {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [textContentDiv, setTextContentDiv] = React.useState();

            // eslint-disable-next-line react-hooks/rules-of-hooks
            React.useEffect(() => {

                const interval = setInterval(() => {
                    getCode(setTextContentDiv);
                }, 1000);
                return () => clearInterval(interval);

            }, []);

            return <div className="App">
                        <div><p>uuid: {stateRedactor.uuid}</p></div>
                        <TextArea className="bp3-fill App-textArea" disabled={true} dir="auto" value={textContentDiv} />
                    </div>;
        }
        default: { break; }
    }

}

function onInputChange(text){
    const stateRedactor = cookies.get('stateRedactor');
    const code = encodeURI(text.target.value);
    axios.post("http://localhost:8080/saveCode", { uuid: stateRedactor.uuid, code: code }).then((res) => {
        if (res.status === 200 && res.data['status'] === 'false'){
            console.log(res.data['message']);
        }
    });
}

function createRedactor() {
    axios.post("http://localhost:8080/generateUUID").then( (res) => {
        if (res.status === 200) {
            stateRedactor = { state: 1, uuid: res.data['uuid'] }
            cookies.set('stateRedactor', stateRedactor);
            window.location.reload();
        }
    });
}

function viewRedactor() {
    const inputUUID = document.getElementById("inputUUID").value;
    if (inputUUID == null || inputUUID === '') {
        alert("Не заполнен UUID");
    } else {
        cookies.set('stateRedactor', { state: 2, uuid: inputUUID });
        window.location.reload();
    }
}

function getCode(setDiv){
    const stateRedactor = cookies.get('stateRedactor');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // const [textContent, setTextContent] = React.useState("");
    axios.post("http://localhost:8080/getCode", {uuid: stateRedactor.uuid}).then((res) => {
        if (res.status === 200 && res.data['status'] === 'true') {
            setDiv(decodeURI(res.data['message']));
        }
    });
    // return textContent
}

export default StartApp;
