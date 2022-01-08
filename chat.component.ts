import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';
import aes from 'crypto-js/aes';
import utf8 from 'crypto-js/enc-utf8';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  userName = '';
  message = '';
  messageList: {message: string, userName: string, mine: boolean}[] = [];
  userList: string[] = [];
  socket: any;
  encryptKey = '';


  constructor() { }

  userNameUpdate(name: any): void {
    this.socket = io.io(`http://${name.ipAddress}/?userName=${name.name}`);
    this.userName = name.name;
    this.encryptKey = name.encryptKey;

    this.socket.emit('set-user-name', name.name);

    this.socket.on('user-list', (userList: string[]) => {
      this.userList = userList;
    });

    this.socket.on('message-broadcast', (data: {message: string, userName: string}) => {
      let message = '';
      try {
        message = aes.decrypt(data.message, this.encryptKey).toString(utf8);
      } catch (e: any) {}

      if (!message) {
        message = 'ERROR: Mesajul nu se poate decripta';
      }

      if (data) {
        this.messageList.push({message: message, userName: data.userName, mine: false});
      }
    });
  }

  sendMessage(): void {
    if(this.message) {
      this.socket.emit('message', aes.encrypt(this.message, this.encryptKey).toString());
      this.messageList.push({message: this.message, userName: this.userName, mine: true});
    }
    this.message = '';
  }

}