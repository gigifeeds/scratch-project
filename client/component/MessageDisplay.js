import React, { Component, useEffect, setState, useState } from "react";
import MessageInput from "./MessageInput";
import EditMessageModal from "./EditMessageModal";
import UserCreator from "./UserCreator";
import UserLogin from "./UserLogin";
import dateFormat from "dateformat";
import Button from "@mui/material/Button";

//need to store array of message somehow, either here or in separate file

//username

//content input

//fetch in the app?
//assume we get the array of messages as a prop

function formatDate(d) {
  //const datestring = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
  //      d.getHours() + ":" + d.getMinutes();
  const pstDate = new Date(Number(d) + 8 * 60 * 60 * 1000);
  return dateFormat(pstDate, "yyyy/mm/d h:MM TT");
}

const MessageDisplay = () => {
  //messages is an array of Message components
  const [state, setState] = useState([]);
  const messages = [];
  let editMessageId = null; //if there is an Id here, the message with that Id will render with an input box
  //push messages each message object from database
  //array object
  //jsoned array object
  function fetchMessages() {
    console.log("attempting fetch");
    fetch("/api/messages")
      .then((res) => res.json())
      .then(setState)
      .catch((err) => console.log("Get Messages: ERROR", err));
  }

  function deleteMessage(el) {
    fetch("/api/messages/" + el.id, { method: "DELETE" })
      .then(() => console.log("Delete Successful"))
      .then(() => setState((state) => state.filter((msg) => msg.id !== el.id)))
      .catch((err) => console.log("Delete Message: ERROR: ", err));
  }

  //redraw the page with the input box
  //if we want to have a modal invisibly generated for each element of the state
  //we need editMessage to toggle it visible
  function editMessage(el) {
    document.getElementById(`editMessageInput${el.id}`).style.display = "block";
    document.getElementById(`message${el.id}`).style.display = "none";
    document.getElementById("edit" + el.id).style.display = "none";
    document.getElementById("saveChanges" + el.id).style.display = "block";
  }
  function updateMessage(el) {
    fetch("/api/messages/" + el.id, {
      method: "PUT",
      body: JSON.stringify({
        content: document.getElementById(`editMessageInput${el.id}`).value,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then(() => console.log("Put Successful"))
      .then(() => fetchMessages());
    document.getElementById(`${"editMessageInput" + el.id}`).style.display =
      "none";
    document.getElementById(`message${el.id}`).style.display = "block";
    document.getElementById("saveChanges" + el.id).style.display = "none";
    document.getElementById("edit" + el.id).style.display = "block";
  }

  useEffect(fetchMessages, []);

  messages.push(
    <tr>
      <th>Date</th>
      <th>Name</th>
      <th>Message</th>
      <th>Actions</th>
    </tr>
  );

  for (const el of state) {
    // console.log(el.id);
    let buttons = <td></td>;
    let editButton = <td></td>;
    let deleteButton = <td></td>;
    let editStatus = (
      <span
        style={{ display: "inline-block", padding: "0px 0px 0px 20px" }}
      ></span>
    );
    if (el.edit) {
      editStatus = (
        <span id="editedFlag" style={{ display: "inline-block", padding: "0px 0px 0px 20px" }}>
          (edited)
        </span>
      );
    }
    if (el.permission) {
      deleteButton = (
        <td className="actionButtons">
          <button
            id={"saveChanges" + el.id}
            className="saveBtn"
            onClick={() => updateMessage(el)}
            style={{ display: "none" }}
          >
            Save
          </button>
          <button
            id={"edit" + el.id}
            className="editBtn"
            onClick={() => editMessage(el)}
          >
            {/* <img src="./Images/editPencil.png" width="90" height="90" alt="Edit" /> */}
            ✏️
          </button>
          <button
            id={"delete" + el.id}
            className="deleteBtn"
            onClick={() => deleteMessage(el)}
          >
            ⌫
          </button>
        </td>
      );
    }
    //cut off long usernames
    let currUsername = el.username;
    if (currUsername.length > 10) {
      currUsername.slice(0, 10);
    }

    //push message components into messages, using el as the source of props
    messages.push(
      <tr key={el.id}>
        <td className="timestamp">{formatDate(new Date(el.time_stamp))}</td>
        <td className="usernameMessage">{currUsername}</td>
        <td className="messageContents">
          <p id={`message${el.id}`} style={{ display: "block" }}>
            {el.content} {editStatus}
          </p>
          <textarea
            id={`editMessageInput${el.id}`}
            style={{ display: "none" }}
            defaultValue={el.content}
          ></textarea>
        </td>
        {/* <td className="actionButtons">{deleteButton}</td> */}
        {deleteButton}
      </tr>
    );
  }
  let checkCookie = document.cookie; //''
  let userLoginDivs = <div></div>;

  if (checkCookie === "") {
    userLoginDivs = (
      <div>
        <UserLogin fetchMessages={fetchMessages} />
        <UserCreator fetchMessages={fetchMessages} />
      </div>
    );
  } else {
    userLoginDivs = (
      <div>
        <div id="MessageContent">
          <div id="MessageDisplay">
            <table>
              <tbody>{messages}</tbody>
            </table>
            <br />
          </div>
        </div>
        <MessageInput
          state={state}
          setState={setState}
          fetchMessages={fetchMessages}
        />
      </div>
    );
  }
  return <div>{userLoginDivs}</div>;
};

export default MessageDisplay;
