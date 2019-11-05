import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import {Dialogflow_V2} from 'react-native-dialogflow';
import {dialogflowConfig} from './env';
import Voice from 'react-native-voice';
import voice_button from './voice_button.jpg';
import google_assistant_speaking from './google_assistant_speaking.jpg';
import {Chip} from 'react-native-paper';
// var Speech = require('react-native-speech');
// import BpkChip from 'react-native-bpk-component-chip'
import {RNChipView} from 'react-native-chip-view';
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
    imgSource: voice_button,
    listening: false,
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

  async handleGoogleResponse(result) {
    let text = 'Sorry, I am unable to connect with Tata Sky.';
    let speech = text;
    let text1, speech1;
    let ans = {};
    if (result && result.queryResult) {
      if (result.queryResult.webhookPayload) {
        console.log(result.queryResult.webhookPayload.google);
        if (
          result.queryResult.webhookPayload.google.richResponse.items.length ===
          2
        ) {
          text1 = result.queryResult.webhookPayload.google.richResponse.items[1]
            .simpleResponse.displayText
            ? result.queryResult.webhookPayload.google.richResponse.items[1]
                .simpleResponse.displayText
            : result.queryResult.webhookPayload.google.richResponse.items[1]
                .simpleResponse.textToSpeech;
          speech1 =
            result.queryResult.webhookPayload.google.richResponse.items[1]
              .simpleResponse.textToSpeech;
        }
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
          result.queryResult.webhookPayload.google.richResponse.items,
        );
      }
    }
    ans.text = text;
    ans.text1 = text1;
    ans.speech = speech;
    ans.speech1 = speech1;
    const promise = new Promise(resolve => {
      console.log('Here in 1');
      this.sendBotResponse(ans);
    });
    console.log('Here 11');
    const res = await promise;
    console.log(res);
    console.log('Here');
    // Voice.start('en-US');
  }

  onSendText(text) {
    console.log(text);
    const speechResult = [];
    console.log('Here');
    speechResult.push(text);
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, speechResult),
    }));
    console.log('Here 2');
    let message = text;
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
    let text1 = ans.text1;
    let msg = {
      _id: this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: BOT_USER,
    };
    let msg1 = {
      _id: this.state.messages.length + 2,
      text: text1 ? text1 : '',
      createdAt: new Date(),
      user: BOT_USER,
    };
    const messagesList = [];
    if (text1) {
      messagesList.push(msg1);
    }
    messagesList.push(msg);
    console.log(messagesList);
    Tts.speak(ans.speech);
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg]),
    }));
    if (ans.text1) {
      setTimeout(() => {
        // console.log('1 sec wait');
        if (ans.speech1) Tts.speak(ans.speech1);
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg1]),
        }));
      }, 4000);
    }
  }

  changeImageButton = () => {
    this.setState({imgSource: google_assistant_speaking});
    return <Image style={styles.voiceButton} source={this.state.imgSource} />;
  };

  // componentWillUnmount() {
  //   Voice.destroy().then(Voice.removeAllListeners);
  // }

  startListening = async () => {
    if (this.state.listening) {
    }
    await Voice.start('en-US');
  };

  toggleListening = async () => {
    const isRecognizing = await Voice.isRecognizing()
      .then(res => {
        return res;
      })
      .catch(err => {
        throw new Error(err);
      });
    if (isRecognizing) {
      try {
        await Voice.cancel();
      } catch (e) {
        console.log(e);
      }
      this.setState({imgSource: voice_button});
    } else {
      try {
        await Voice.start('en-US');
      } catch (e) {
        console.log(e);
      }
      this.setState({imgSource: google_assistant_speaking});
    }
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages, [])}
          user={{
            _id: 1,
          }}
          showUserAvatar={true}
          alwaysShowSend={true}
        />
        <ScrollView
          horizontal={true}
          style={styles.chipScrollView}
          contentContainerStyle={{alignContent: 'center'}}>
          <RNChipView
            title={'Check Balance'}
            // theme={0}
            avatar={false}
            titleStyle={{padding: 15}}
            containerStyle={{
              flexGrow: 1,
              marginTop: 0,
              marginBottom: 0,
              marginRight: 15,
              marginLeft: 15,
            }}
          />
          {/*<Chip style={styles.chipScrollView} onPress={alert('Hello')}>Monthly Statement</Chip>*/}
          <RNChipView
            title={'Mobile Number'}
            avatar={false}
            titleStyle={{padding: 15}}
            containerStyle={{
              flexGrow: 1,
              marginTop: 0,
              marginBottom: 0,
              marginRight: 15,
              marginLeft: 15,
            }}
            onPress={() => {
              let speech = "Mobile Number"
              let message = {
                _id: this.state.messages.length + 1,
                text: speech,
                createdAt: new Date(),
                user: USER,
              };
              this.setState(previousState => ({
                messages: GiftedChat.append(previousState.messages, message),
                imgSource: voice_button,
              }));
              Dialogflow_V2.requestQuery(
                speech,
                result => this.handleGoogleResponse(result),
                error => console.log(error),
              );
            }}
          />
          <RNChipView
            title={'Check Due Date'}
            avatar={false}
            titleStyle={{padding: 15}}
            containerStyle={{
              flexGrow: 1,
              marginTop: 0,
              marginBottom: 0,
              marginRight: 15,
              marginLeft: 15,
            }}
          />
        </ScrollView>
        <TouchableOpacity
          onPress={() => {
            Voice.onSpeechStart = () => console.log('Start');
            Voice.onSpeechEnd = () => console.log('End');
            Voice.onSpeechError = err => {
              this.setState({imgSource: voice_button});
              console.log('Error', err);
            };
            Tts.stop();
            this.toggleListening();
          }}>
          <Image style={styles.voiceButton} source={this.state.imgSource} />
          {
            (Voice.onSpeechResults = res => {
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
                imgSource: voice_button,
              }));
              Dialogflow_V2.requestQuery(
                speech,
                result => this.handleGoogleResponse(result),
                error => console.log(error),
              );
            })
          }
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  voiceButton: {
    padding: 10,
    margin: 5,
    height: 38,
    alignSelf: 'center',
    width: 25,
    resizeMode: 'stretch',
  },
  chipScrollView: {
    flex: 1,
    maxHeight: 50,
  },
});

export default App;
