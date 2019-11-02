import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Button} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import {Dialogflow_V2} from 'react-native-dialogflow';
import {dialogflowConfig} from './env';
import Voice from 'react-native-voice';
// import * as Speech from 'react-native-speech';
import Tts from 'react-native-tts';

const BOT_USER = {
  _id: 2,
  name: 'Tata Sky Bot',
  avatar:
    'https://www.tatasky.com/wps/portal/TataSky/home/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOJ9_A0MjLwsDLz8DYLcDByD3fycLH2cnEItzIEKIoEKDHAARwNC-sP1o9CUBLu4Gjh6h3n6mQd7GLmaGUMV4LGiIDfCINNRUREAA4-YHg!!/images/tata-sky-logo.png',
};

const USER = {
  _id: 1,
  name: 'User',
};

class App extends Component {
  state = {
    messages: [
      {
        _id: 1,
        text: `Hi! I am the FAQ bot from Tata Sky. \n\nHow may I help you today ?`,
        createdAt: new Date(),
        user: BOT_USER,
      },
    ],
    recognized: '',
    pitch: '',
    error: '',
    end: '',
    started: '',
    results: '',
    partialResults: [],
    finalResult: '',
    listeningState: '',
  };

  constructor(props) {
    super(props);
    Voice.onSpeechStart = () => console.log('Start');
    Voice.onSpeechEnd = () => console.log('End');
    Voice.onSpeechError = err => console.log('Error', err);
  }

  componentDidMount() {
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_ENGLISH_US,
      dialogflowConfig.project_id,
    );
  }

  handleGoogleResponse(result) {
    let text = 'Sorry, I am unable to connect with Tata Sky.';
    let speech = text;
    let ans = {};
    if (result && result.queryResult) {
      if (result.queryResult.webhookPayload) {
        text = result.queryResult.webhookPayload.google.richResponse.items[0]
          .simpleResponse.displayText
          ? result.queryResult.webhookPayload.google.richResponse.items[0]
              .simpleResponse.displayText
          : result.queryResult.webhookPayload.google.richResponse.items[0]
              .simpleResponse.textToSpeech;
        speech =
          result.queryResult.webhookPayload.google.richResponse.items[0]
            .simpleResponse.textToSpeech;
        console.log(
          result.queryResult.webhookPayload.google.richResponse.items[0],
        );
      }
    }
    ans.text = text;
    ans.speech = speech;
    this.sendBotResponse(ans);
    // Speech.speak({text: speech})
  }

  onSendSpeech(messages = [], speechResult = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, speechResult),
    }));

    let message = speechResult[0];
    Dialogflow_V2.requestQuery(
      message,
      result => this.handleGoogleResponse(result),
      error => console.log(error),
    );
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));

    let message = messages[0].text;
    Dialogflow_V2.requestQuery(
      message,
      result => this.handleGoogleResponse(result),
      error => console.log(error),
    );
  }

  sendBotResponse(ans) {
    let text = ans.text;
    let msg = {
      _id: this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: BOT_USER,
    };

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg]),
    }));

    Tts.speak(ans.speech);
  }

  // componentWillUnmount() {
  //   Voice.destroy().then(Voice.removeAllListeners);
  // }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages, [])}
          user={{
            _id: 1,
          }}
        />
        <Button
          title="Press me"
          onPress={() => {
            Voice.onSpeechStart = () => console.log('Start');
            Voice.onSpeechEnd = () => console.log('End');
            Voice.onSpeechError = err => console.log('Error', err);
            Tts.stop();
            Voice.start('en-US');
            Voice.onSpeechResults = res => {
              console.log(res);
              let speech = res.value[0];
              let message = {
                _id: this.state.messages.length + 1,
                text: speech,
                createdAt: new Date(),
                user: USER,
              };
              this.setState(previousState => ({
                messages: GiftedChat.append(previousState.messages, message),
              }));
              Dialogflow_V2.requestQuery(
                speech,
                result => this.handleGoogleResponse(result),
                error => console.log(error),
              );
            };
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  voiceButton: {
    padding: 10,
    margin: 5,
    height: 25,
    width: 25,
    resizeMode: 'stretch',
  },
  separatorVoice: {
    backgroundColor: '#fff',
    width: 1,
    height: 40,
  },
});

export default App;
