import React, { Component } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  ListView, FlatList,
  StatusBar,
  TouchableOpacity,
  Animated, Linking,
  View, Alert,KeyboardAvoidingView, TextInput, SafeAreaView,TouchableHighlight,
  Modal, Clipboard,InteractionManager, ImageBackground, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
////import { WebBrowser } from 'expo';
import Constants from 'expo-constants'
import { MonoText } from '../components/StyledText';
import Meteor, { withTracker } from 'react-native-meteor';
import { EvilIcons, Entypo, Feather, MaterialCommunityIcons, Octicons, AntDesign, Ionicons,MaterialIcons, FontAwesome  } from '@expo/vector-icons';
import { DrawerActions, NavigationActions } from 'react-navigation'
import styleMain from '../style/style';
//
import {HeaderButtons,  HeaderButton, Item } from 'react-navigation-header-buttons';
import { CardItem, Card, Left, Thumbnail, Body, Text, Right, RefreshControl, List, ListItem } from 'native-base';
import { Input } from 'native-base'

import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Ionicons';
import GiphySearch from '../components/GiphySearch';
import searchGifs from '../components/searchGifs';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { isIphoneX } from 'react-native-iphone-x-helper'
//import { Icon } from "react-native-elements";
const NAVBAR_HEIGHT = 64;
const STATUS_BAR_HEIGHT = Platform.select({ ios: 20, android: 24 });
import _ from 'lodash';

const AnimatedListView = Animated.createAnimatedComponent(FlatList);
//const AnimatedListView = Animated.createAnimatedComponent(RecyclerListView);

import Post from '../components/post';

import { cleanFeedList } from '../components/feedlist';
import withBadge from '../components/withBadge';

//import Modal from "react-native-modalbox";
//import Dimensions from "Dimensions";
import { Avatar } from 'react-native-elements';


import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'

import { decode, encode } from 'base-64';
import b64toBlob from 'b64-to-blob';
import Slingshot from '../SlingShot/slingshot';
import { Camera } from 'expo-camera';
import { Dropdown } from 'react-native-material-dropdown-v2';
import AvatarDMComp from  './avatarDM';
import moment from 'moment';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import PostAttachment from './postAttachment';
import ActionSheet from 'react-native-actionsheet'
import KeyboardSpacer from 'react-native-keyboard-spacer';

import { Navigation } from 'react-native-navigation';
const WWW_URL_PATTERN = /^www\./i
var formatDate = function (date) {
  if (!date) return;
  if(date != null){
    ////console.log("date",date)
    var date = new Date(date);
    ////console.log("new date")
    var then = date.getTime();
    var now  = new Date().getTime();
    var weekInMilliseconds = 604800000;
  
    if (now - then > weekInMilliseconds) {
      return moment(date).format('D MMM YYYY');
    }
    return moment(date).fromNow();
  }
};

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

const height = '95%';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
class LikeButton extends Component {
    constructor(props){
        super(props);  
        this.Unlike = this.Unlike.bind(this);
        this.LikeOnly = this.LikeOnly.bind(this);
        var likedByMe;
        var user = Meteor.user();
        if(this.props.currentMessage && this.props.currentMessage.likedByUsername && user){
            if(this.props.currentMessage.likedByUsername.indexOf(user.username) > -1){
                likedByMe = true;
            }
        }
        var count = 0;
        if(this.props.currentMessage && this.props.currentMessage._likeCount && this.props.currentMessage._likeCount > 0){
          count = this.props.currentMessage._likeCount 
        }
        this.state = {
          counter: count,
          likedByMe: likedByMe
        };
    } 
    componentDidUpdate(nextProps){
      //console.log("this.props.currentMessage", this.props.currentMessage)
      if(nextProps.currentMessage && this.props.currentMessage && nextProps.currentMessage != this.props.currentMessage){
        var likedByMe;
        var user = Meteor.user();
        if(this.props.currentMessage && this.props.currentMessage.likedByUsername && user){
            if(this.props.currentMessage.likedByUsername.indexOf(user.username) > -1 && this.state.counter == 0){
                likedByMe = true;
                var count = this.state.counter;
                count = count + 1;        
                this.setState({
                  counter: count,
                  likedByMe: likedByMe
                });                
            }
        }  

      }      
    }
    
    Unlike = function(event){
        var count = this.state.counter;
        count = count - 1;   
        if(count < 0){
          count = 0;
        }
        this.setState({
            likedByMe:false,
            counter: count
        })          
        var Post = this.props.post;
        if(this.props.currentMessage){
          Meteor.call('subThreadMessageUnlike',this.props.currentMessage._id); 
        }
    }
    
    LikeOnly = function(event){
        var count = this.state.counter;
        count = count + 1;
        this.setState({
            likedByMe:true,
            counter: count,
        })            
        var Post = this.props.post; 
        if(this.props.currentMessage){
          Meteor.call('subThreadMessageLike',this.props.currentMessage._id);  
        }
    }    
    render(){
      var myMessage;
      if(this.props.currentMessage && this.props.currentMessage.user && this.props.currentMessage.user._id == Meteor.userId()){
        myMessage = true;
      }
      if(this.state.likedByMe){
        return(<View >
          <TouchableOpacity style={myMessage ? [styles.socialBarSection,{justifyContent: "flex-end",}] : [styles.socialBarSection,{}]} onPress={this.LikeOnly}>
            <AntDesign name="heart" size={18}  color={"#FC5037"} style={{marginTop: 4, marginLeft: 10}}/>
            <Text style={[{color:"#FC5037", fontSize:13, fontWeight: 'bold', marginLeft:4, marginTop: 5}]}>{this.state.counter}</Text> 
          </TouchableOpacity>
        </View>)        
      }
      else if(this.state.counter > 0){
        return  (<View >
                      <TouchableOpacity style={myMessage ? [styles.socialBarSection,{justifyContent: "flex-end",}] : [styles.socialBarSection,{}]} onPress={this.LikeOnly}>
                        <AntDesign name="hearto" size={17}  color={this.props.DarkTheme ? '#B4B4B4': "#454545"} style={{justifyContent: 'center',alignItems: 'center', marginTop: -1, marginLeft: 10}}/>
                        <Text style={this.props.DarkTheme ? [{color:"#B4B4B4", fontSize:12, fontWeight: 'bold', marginLeft:4, justifyContent: 'center',alignItems: 'center', marginTop: -3}]: [{color:"#454545", fontSize:12, fontWeight: 'bold', marginLeft:4, justifyContent: 'center',alignItems: 'center', marginTop: -3}]}>{this.state.counter}</Text> 
                      </TouchableOpacity>
                    </View> )          
      }
      return(<View />)   
    }
  
}





class SubThreadItemComp extends React.Component {
    
    constructor(props) {
        super(props);
        //StatusBar.setBackgroundColor('#6F45E5');
        //StatusBar.setBarStyle('light-content');
        this.onEndReachedCalledDuringMomentum = true;
        const scrollAnim = new Animated.Value(0);
        const offsetAnim = new Animated.Value(0);

        this.state = {
          loading: false,
          mounted: false,
          isLoadingEarlier: null,
          messageCount:15,
          selectedIndex: 0,
          refreshing:false,
          dataSource: [],
          data: [],
          dataSource: [],
          dataReady:null,
          open: false,
          text: null,
          postType: null,
          visibleModal: false,
          text: null,
          imageUri: null,
          imageSignature:null,
          notLoaded:true,
          removeUsersCalled: null,
          currentMessage: null,
          maxCount: null,
          skip: 0,
          masterList: null,
          deleted: [],
          liked: [],
          meetupMembers: [],
          meetupObj:[],
          meetupRequests:[],
          subThread:[],
          requestedAccessSent: null,
          imageUrl: null, is_gif_modal_visible: false,
          query: null, search_results: null, is_emoji_modal_visible: null
        };
    
        var self = this;
        this.onSend = this.onSend.bind(this);
        this.renderBubble = this.renderBubble.bind(this)
        this.requestAccess = this.requestAccess.bind(this);
        this.joinGroup = this.joinGroup.bind(this)
        this.getMoreMessages = this.getMoreMessages.bind(this)
        this.deleteMsg = this.deleteMsg.bind(this)
        this.renderInputToolbar = this.renderInputToolbar.bind(this)
        this.renderChatFooter = this.renderChatFooter.bind(this)
        this.dismissReply = this.dismissReply.bind(this)   
        this.handleUrlPress = this.handleUrlPress.bind(this)
    }
    _clampedScrollValue = 0;
    _offsetValue = 0;
    _scrollValue = 0;

    componentDidMount = async () =>  {
      this._mounted = true;
      var self = this;
      if(this.props.DarkTheme == true){
        self.setState({
          DarkTheme: true,
          switchValue: true,
        })
      }  
      InteractionManager.runAfterInteractions(() => {
        Meteor.call('subThreadEnterRoom', this.props.subId, this.props.groupId)
        Meteor.call("getSubThreadHistory", this.props.subId, 0, this.props.groupId, function(err, res){
          if(res){

            self.setState({
              masterList: res
            })
          }
        })       
        Meteor.call("subThreadInfo", this.props.subId, function(err, res){
          if(res){
            self.setState({
              subThread: res
            })
          }
        })        
        Meteor.call("maxSubThreadCount", this.props.subId, function(err, res){
          if(res){
            self.setState({
              maxCount: res
            })
          }
        })
        if(this.props.groupId){
          Meteor.call("meetupFunc", this.props.groupId, 0, function(err, res){
            if(res){
              self.setState({
                meetupObj: res
              })
            }
          })      
          Meteor.call("meetupRequests", this.props.groupId, 0, function(err, res){
            if(res){
              self.setState({
                meetupRequests: res
              })
            }
          })        
          Meteor.call("meetupMembersFun", this.props.groupId, 0, function(err, res){
            if(res){
              self.setState({
                meetupMembers: res
              })
            }
          }) 
         
        }
          Meteor.call('getBlockedIdMessage', function(err, res){
            if(res && res.length > 0){
              var list = self.state.deleted;
              if(list == null){
                list = []
              }
              var full = list.concat(res)
              self.setState({
                deleted: full
              })
            }
          })         
      });
    }   
    shouldComponentUpdate(nextProps, nextState){
      if(nextProps.messages && this.props.messages && this.props.messages.length < nextProps.messages.length){
        return true;
      }
      else if(nextProps.messages && this.props.messages && this.props.messages.length == 1 && nextProps.messages.length == 0){
        return true;
      }
      else if(nextProps.messages && this.props.messages && this.props.messages.length > 10 && nextProps.messages.length < 1){
        return false;
      }else{
        return true;
      }     
    }
    componentWillUnmount(){
      this._mounted = false;
      if(this.props.handler1){
        this.props.handler1.stop();  
      }
      if(this.props.handler2){
        this.props.handler2.stop();
      }
      if(this.props.handler3){
        this.props.handler3.stop();
      }
      if(this.props.handler4){
        this.props.handler4.stop();
      }
      if(this.props.handler5){
        this.props.handler5.stop();
      }
      if(this.props.handler6){
        this.props.handler6.stop();
      }
    } 
    handleUrlPress(props){
      //console.log("props", props)
      if (WWW_URL_PATTERN.test(props)) {
        this.handleUrlPress(`http://${props}`)
      } else {
        Linking.canOpenURL(props).then(supported => {
          if (!supported) {
            console.error('No handler for URL:', props)
          } else {
            Linking.openURL(props)
          }
        })
      } 
    }
    setModalVisible(visible, imageUrl) {
      this.setState({ is_gif_modal_visible: visible, imageUrl: imageUrl });
    }    
    showActionSheet = (currentMessage) => {
      var user = Meteor.user();
      if(currentMessage && currentMessage.user && currentMessage.user._id == Meteor.userId() || user && user.roles  && user.roles.indexOf("admin") > -1){
        this.setState({
          currentMessage: currentMessage
        })
        this.ActionSheet.show(currentMessage)  
      }
    }   
    showActionSheet2 = (currentMessage) => {
      var user = Meteor.user();
      if(currentMessage){
        this.setState({
          currentMessage: currentMessage
        })
        this.ActionSheet2.show(currentMessage)  
      }
    }  
    showActionSheet3 = (currentMessage) => {
      var user = Meteor.user();
      this.setState({
        currentMessage: currentMessage
      })
      this.ActionSheet3.show(currentMessage)  
    }   
    showActionSheet4 = (currentMessage) => {
      var user = Meteor.user();
      this.setState({
        currentMessage: currentMessage
      })
      this.ActionSheet4.show(currentMessage)  
    }         
    _pickImage = async () => {

        await Permissions.askAsync(Permissions.CAMERA_ROLL).then((data) => {
            ////console.log("data ask permission",data)
            if (data.status !== 'granted') {
              return;
            }
        });
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes:'Images',
          allowsEditing: true,
          aspect: [4, 3],
        });
    
        ////console.log(result);
    
        if (!result.cancelled) {
          let resizeObj = {
          };
          if (result.height > result.width) {
            resizeObj = {
              height: 1350
            };
          } else {
            resizeObj = {
              width: 1350
            };
          }
          let manipResult = await ImageManipulator.manipulateAsync(
            result.uri,
            [{
              resize: resizeObj
            }],
            //[],
            {
              compress: .7,
              format: 'jpeg',
            }
          );
          // if (Platform.OS === 'android' && manipResult.width > 850) {
          //   manipResult = await ImageManipulator.manipulateAsync(
          //     result.uri,
          //     [{
          //       rotate: 90
          //     }, {
          //       resize: resizeObj
          //     }],
          //     {
          //       format: 'jpeg',
          //     }
          //   );
          // }
          
    
            // const signature = await FileSystem.readAsStringAsync(manipResult.uri, {
            //     encoding: FileSystem.EncodingType.Base64
            // });   
            
            const signature = await FileSystem.readAsStringAsync(manipResult.uri, {
              encoding: FileSystem.EncodingType.Base64
            });
            const contentType = 'image/jpeg';
            const fileTemp = b64toBlob(signature);
            const fileBlob = fileTemp._data;  
            const f = {
              type: contentType,
              size: 9000000,
              name: `${guid()}.jpeg`,
              uri: manipResult.uri
            };
            if (manipResult.uri) {
              var fname = guid();
              var ExtensionName = `${fname.name}.jpeg`;
              const uploader = new Slingshot.Upload('onyx-uploads');
              var self = this;
              uploader.send(f, (error, downloadUrl) => {
                if (error) {
                        ////console.log(error);
                }
                const user = Meteor.user();
                if(this.state.currentMessage){
                  Meteor.call('sendFileSubthreadMsg', ExtensionName, downloadUrl, fileBlob.size,  this.props.subId);
                  self.setState({
                    currentMessage: null,
                  })
                }
              
              }) 
            }
        }
    };    
    
    _pickVideo = async () => {
        
      await Permissions.askAsync(Permissions.CAMERA_ROLL).then((data) => {
          ////console.log("data ask permission",data)
          if (data.status !== 'granted') {
            return;
          }
      });
      const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes:'Videos',
          allowsEditing: true,
          aspect: [4, 3],
          base64:true
      });
  
      // //console.log("video result", result);
      // this.setState({
      //   isThumbnail: true,
      // })    
      if (!result.cancelled) {
        

        var imageUri = await VideoThumbnails.getThumbnailAsync(
          result.uri,
          {
            time: 900,
          }
        );

          // const signature = await FileSystem.readAsStringAsync(result.uri, {
          //   encoding: FileSystem.EncodingType.Base64
          // });
          // const contentType = 'image/jpeg';
          // const fileTemp = b64toBlob(signature);
          // const fileBlob = fileTemp._data;           
          
          
          var fileSizeVideo = await FileSystem.getInfoAsync(result.uri);
          
          //console.log("fileSizeVideo ", fileSizeVideo)
              
          this.setState({
              videoUri: result.uri,
              videoHeight: result.height,
              videoWidth: result.width,
              isThumbnail: null,
              videoFileSize: 80000000,
              imageUri: imageUri.uri,
              imageFileSize: 5000,
          })
          var self = this;
          if(fileSizeVideo.size <  80000000 ){
            Meteor.call('subThreadAddMsg', this.props.subId, '', function(err,result){
              //console.log("result", result)
              if(self.state.currentMessage && result){
                //const postId = result;
                const contentType = 'image/jpeg';
                ////console.log("signature",self.state.imageSignature)
                // const fileTemp = b64toBlob(self.state.imageSignature);
                // const fileBlob = fileTemp._data;
                //console.log('fileBlob');
                var ExtensionName = guid();
                const f = {
                  type: contentType,
                  name: `${ExtensionName}.jpeg`,
                  uri: self.state.imageUri,
                  size: 9000000,
                };
                const contentType2 = 'video/mp4';
                ////console.log("signature",self.state.imageSignature)
                // const fileTemp2 = b64toBlob(self.state.videoSignature);
                // const fileBlob2 = fileTemp2._data;
                ////console.log('fileBlob2', fileBlob2);
                const uploader = new Slingshot.Upload('onyx-uploads');
                uploader.send(f, (error, downloadUrl) => {
                  if (error) {
                    //console.log(error);
                  }
                  //console.log('downloadUrl', downloadUrl);
                  const user = Meteor.user();
                  Meteor.call('subthreadVideoPosterIMage',ExtensionName, downloadUrl, self.state.imageFileSize, result,
                  
                  function(err, res){
                  }); 
    
                });    
                var fname = `${name}.mp4`;              
                const f2 = {
                  type: contentType2,
                  size: 80000000,
                  name: fname,
                  uri: self.state.videoUri
                };   
                
                if ( self.state.videoUri) {
                  //console.log('fileBlob2');
                  var name = guid();
                  
                  // delete fileBlob2.blobId;
                  // delete fileBlob2.offset;
                  //console.log('f2', f2);
                  const uploader2 = new Slingshot.Upload('onyx-uploads');
                  uploader2.send(f2, (error, downloadUrl2) => {
                    if (error) {
                      ////console.log(error);
                    }
                    //console.log('uploader2',downloadUrl2);
                    const user = Meteor.user();
                    Meteor.call('sendFileSubthreadMsgVideoWithPoster', fname, downloadUrl2, self.state.videoFileSize,result,self.props.subId,
                    
                    function(err, res){
                    }); 
                    
                    self.setState({
                      currentMessage: null,
                    })
      
                  });
              }                  
                  
              }  
            });             
       
          }else{
            Alert.alert(
              'Video too Big',
              'please choose a smaller video',
              [
                {
                  text: 'OK', onPress: () => {this.clickFunction}
                },
              ],
            );                   
          }
      }
  };        
    
    renderItem(obj){
      var mounted = this._mounted;
      if(obj && obj.currentMessage && obj.currentMessage.user){
        var username, avatar, checkMessage;
        if(obj.currentMessage.methodSource == true){
          checkMessage = true;
        }
        username = obj.currentMessage.user.name;
        avatar = obj.currentMessage.avatar;
        //console.log("avatar props", this.props.subId)
        return <AvatarDMComp avatarUrl={avatar} dontCheck={true} username={username} subId={this.props.subId}
        MessageS={this.props.MessageS} parentMounted={mounted}/>
      }
      return <View />
    }
    
    renderImage(obj){
      var adminAccess, id;
      var user = Meteor.user();      
      if(obj && obj.currentMessage && obj.currentMessage.user && obj.currentMessage.user._id == Meteor.userId() || user && user.roles  && user.roles.indexOf("admin") > -1){   
        adminAccess = true;
        id = obj.currentMessage._id
      } 
      if(adminAccess && obj && obj.currentMessage && obj.currentMessage.image){
        var attachments;
        attachments = obj.currentMessage.attachments;
        return <PostAttachment attachments={attachments} onlongPressTrue={true} onLongPress={this.LongPress} currentMessage={obj.currentMessage} 
        DarkTheme={this.state.DarkTheme} showActionSheet4={this.showActionSheet4} showActionSheet3={this.showActionSheet3}/>
      }      
      else if(obj && obj.currentMessage && obj.currentMessage.image){
        var attachments;
        attachments = obj.currentMessage.attachments;
        return <PostAttachment attachments={attachments}onlongPressTrue={true}  DarkTheme={this.state.DarkTheme} onLongPress={this.LongPress} 
        currentMessage={obj.currentMessage} showActionSheet4={this.showActionSheet4} showActionSheet3={this.showActionSheet3}/>
      }
      return <View />
    }    
    
    renderVideo(obj){
      if(obj && obj.currentMessage && obj.currentMessage.video){
        var attachments;
        attachments = obj.currentMessage.attachments;
        //attachments = attachments[0];
        return <PostAttachment attachments={attachments} messageComp={true} currentMessage={obj.currentMessage}
        DarkTheme={this.state.DarkTheme} onLongPress={this.LongPress}  videoImage={obj.currentMessage.videoImage}
        showActionSheet4={this.showActionSheet4} showActionSheet3={this.showActionSheet3}/>
      }
      return <View />
    }    


    renderActions(obj){
      return <TouchableOpacity
        style={[style1.container]}
        onPress={this.showActionSheet2}
      >
        <View style={[style1.wrapper]}>
          <Text style={[style1.iconText]}>+</Text>
        </View>
      </TouchableOpacity>
    }    

    renderSend(obj) {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center',}}>
            <TouchableOpacity   onPress={() => this.setState({ is_gif_modal_visible: true })}>
              <Text style={{ color: '#c2c2c2' }}>GIF</Text>
            </TouchableOpacity>
            <View>
              <View style={styles.btnSend}>
                <Button
                buttonStyle={{width: 50,alignSelf: 'flex-end', marginTop: -1}}
                titleStyle={{color: "#0084FF"}}
                type="clear"
                icon={
                  <Icon
                    name="send"
                    size={20}
                    color="#0084FF"
                  />
                }
                onPress={() => this.onSend()}
                />
              </View>
            </View>
          </View>          
        );
    } 
    
    deleteMsg(id){
      Meteor.call('subThreadDeleteMsg',id);    
      var arr = this.state.deleted;
      arr.push(id);
      this.setState({
        deleted: arr
      })
    }
    handleEmailPress(props){
      Clipboard.setString(props);
    }   
    
    goToHistory(message){
      if(message){
        var messageId;
        if(message.replyId){
          messageId = message.replyId
        }else{
          messageId = message._id
        }
        // this.props.navigation.navigate('ReplyMessages', {
        //    messageId: messageId,
        //    subId: this.props.subId,
        // })
        Navigation.push('ReplyMessagesId',{
          component: {
            name: 'ReplyMessages',
            passProps:{
              subId: this.props.subId,
              messageId: messageId,
            },
            options: {
              animations: {
                push: {
                  content: {
                      x: {
                          from: -1000,
                          to: 0,
                          duration: 300,
                      },
                    },
                },
                pop: {
                  content: {
                      x: {
                          from: 1000,
                          to: 0,
                          duration: 0,
                      },
                    },
                },   
              },                 
              statusBar: {
                visible: true,
                drawBehind:false,
                style: 'light',
                backgroundColor: "#0084FF",
              },                          
              topBar: {
                animate: false,
                visible: true,
                noBorder: true,
                elevation: 0,
                title: {
                  text: 'Message Replies',
                  color: '#fff',
                },                
                background: {
                  color: '#0084FF',
                },
                backButton:{
                  visible:true,
                  color: '#fff',
                  showTitle: false
                },        
              },                                                                                                                                
              bottomTabs: {
                visible: false,
              } 
            } 
          }
        })         
      }
    }
    
    renderBubble(props) {
      var adminAccess, id;
      var user = Meteor.user();
      if(props && props.currentMessage && props.currentMessage.user && props.currentMessage.user._id == Meteor.userId() || user && user.roles  && user.roles.indexOf("admin") > -1){   
        adminAccess = true;
        id = props.currentMessage._id
      }
      var str = props.currentMessage.replyBody;
      var trimmedString;
      if(str){
        trimmedString = str.substring(0, 60) + ".."
      }
      if(props && props.currentMessage && props.currentMessage.reply && props.currentMessage.user._id == Meteor.userId()){
        if(props && props.currentMessage && props.currentMessage.reply && props.currentMessage.replyattachments && props.currentMessage.replyattachments[0] != null){
            var attachments;
            attachments = props.currentMessage.replyattachments[0];          
            return(<TouchableOpacity onPress={() => this.goToHistory(props.currentMessage)} onLongPress={() => this.LongPress(props.currentMessage)} style={{alignItems: 'flex-end', right: 0, marginBottom: 25}}>
            <View style={[this.props.containerStyle,{maxWidth: '85%', minWidth: '78%'}]}>
              <View >
                <View style={this.state.DarkTheme ? {backgroundColor: '#fff',  borderRadius: 10}:{backgroundColor: '#fff', borderColor: '#eee', borderWidth:1, borderRadius: 10}}>
                  <View style={{flexDirection: 'row',}}>
                    <View style={{ padding: 5, flex: 1, }}>
                        <View style={{flex:1,width: 10, backgroundColor: '#469A10', borderTopLeftRadius: 15,}} />
                        <View style={{flex: 1,flexDirection: 'column', backgroundColor: "#fff", color: '#000', marginRight: 0, borderRadius: 5, borderColor:'#469A10', borderLeftWidth:5}}>
                            <Text style={{color: '#469A10', paddingHorizontal: 10, paddingTop: 5, fontSize: 12,}}>{props.currentMessage.replyUsername}</Text>
                            <PostAttachment attachments={props.currentMessage.replyattachments[0]} onlongPressTrue={true} onLongPress={this.LongPress}  
                            currentMessage={props.currentMessage} showActionSheet4={this.showActionSheet4} id={props.currentMessage._id} showActionSheet3={this.showActionSheet3} />
                            
                              <Text style={{color: '#469A10',  paddingTop: 5, paddingLeft: 5, paddingRight: 5, fontSize: 12, lineHeight: 22}}>click to read full conversation</Text>
                            
                          </View>
                        </View>
                    </View>
                    <View style={{flexDirection: 'column'}}>
                        <Text style={this.state.DarkTheme ? {color: '#000', paddingHorizontal: 10, paddingTop: 5, fontSize: 15,lineHeight:28,marginTop: 10}:
                        {color: '#000', paddingHorizontal: 10, paddingTop: 5, fontSize: 15,lineHeight:28,marginTop: 10}}>{props.currentMessage.text}</Text>
                    </View>
                </View>
              </View>
              <LikeButton currentMessage={props.currentMessage} DarkTheme={this.state.DarkTheme}/>
            </View>
            </TouchableOpacity>
            )          
        }
        else{
          return (
            <TouchableOpacity onPress={() => this.goToHistory(props.currentMessage)} onLongPress={() => this.LongPress(props.currentMessage)} style={{alignItems: 'flex-end', right: 0, marginBottom: 25}}>
            <View style={[this.props.containerStyle,{maxWidth: '85%', minWidth: '80%'}]}>
              <View>
                <View style={this.state.DarkTheme ? {backgroundColor: '#fff',  borderRadius: 10}:{backgroundColor: '#fff', borderColor: '#eee', borderWidth:1, borderRadius: 10}}>
                  <View style={{flexDirection: 'row',}}>
                    <View style={{ padding: 5, flex: 1, }}>
                        <View style={{flex: 1,flexDirection: 'column', backgroundColor: "#fff", color: '#000', marginRight: 0, borderRadius: 5, borderColor:'#469A10', borderLeftWidth:5}}>
                          <Text style={{color: '#469A10', paddingTop: 5, fontSize: 12, paddingLeft: 5, paddingRight: 5}}>{props.currentMessage.replyUsername}</Text>
                          <Text style={{color: '#000',  paddingTop: 5, paddingLeft: 5, paddingRight: 5, fontSize: 12, lineHeight: 22}}>{trimmedString}</Text>
                          <Text style={{color: '#469A10',  paddingTop: 5, paddingLeft: 5, paddingRight: 5, fontSize: 12, lineHeight: 22}}>click to read full conversation</Text>
                        </View>
                      </View>
                    </View>
                    <View style={{flexDirection: 'column'}}>
                        <Text style={this.state.DarkTheme ? {color: '#000', paddingHorizontal: 10, paddingTop: 5, fontSize: 15,lineHeight:28,marginTop: 10}:
                        {color: '#000', paddingHorizontal: 10, paddingTop: 5, fontSize: 15,lineHeight:28,marginTop: 10}}>{props.currentMessage.text}</Text>
                    </View>
                </View>
              </View>
              <LikeButton currentMessage={props.currentMessage} DarkTheme={this.state.DarkTheme}/>
            </View>
            </TouchableOpacity>)
        }
      }      
      else if(props && props.currentMessage && props.currentMessage.reply){
            //console.log("props.currentMessage", props.currentMessage)        
        if(props && props.currentMessage && props.currentMessage.reply && props.currentMessage.replyattachments && props.currentMessage.replyattachments[0] != null){
            var attachments;
            attachments = props.currentMessage.replyattachments[0];          
            return(<TouchableOpacity onPress={() => this.goToHistory(props.currentMessage)} onLongPress={() => this.LongPress(props.currentMessage)} style={{alignItems: 'flex-start', left: 0, marginBottom: 25}}>
            <View style={[this.props.containerStyle,{maxWidth: '85%', minWidth: '78%'}]}>
              <View >
                <View style={this.state.DarkTheme ? {backgroundColor: '#737373', borderRadius: 10}:{backgroundColor: '#fff', borderRadius: 10, borderColor: '#fff', borderWidth: 1}}>
                  <View style={{flexDirection: 'row',}}>
                    <View style={{ padding: 5, flex: 1, }}>
                        <View style={{width: 5, backgroundColor: '#FF917E', borderTopLeftRadius: 15,}} />
                        <View style={{flex: 1,flexDirection: 'column', backgroundColor: "#F6F6F6", color: '#000', marginRight: 0, borderRadius: 5, borderColor:'#FF917E', borderLeftWidth:5}}>
                            <Text style={{color: '#FF917E', paddingHorizontal: 10, paddingTop: 5, fontSize: 12,}}>{props.currentMessage.replyUsername}</Text>
                            <PostAttachment attachments={props.currentMessage.replyattachments[0]} onlongPressTrue={true}  onLongPress={this.LongPress}  
                            currentMessage={props.currentMessage} showActionSheet4={this.showActionSheet4} id={props.currentMessage._id} showActionSheet3={this.showActionSheet3} />
                            <Text style={{color: '#FF917E',  paddingTop: 5, paddingLeft: 5, paddingRight: 5, fontSize: 12, lineHeight: 22}}>click to read full conversation</Text>
                          </View>
                        </View>
                    </View>
                    <View style={{flexDirection: 'column'}}>
                        <Text style={this.state.DarkTheme ? {color: '#fff', paddingHorizontal: 10, paddingTop: 5,fontSize: 15,lineHeight:28,marginTop: 10}:
                        {color: '#000', paddingHorizontal: 10, paddingTop: 5,fontSize: 15,lineHeight:28,marginTop: 10}}>{props.currentMessage.text}</Text>
                    </View>
                </View>
              </View>
            </View><LikeButton currentMessage={props.currentMessage} DarkTheme={this.state.DarkTheme}/>
            </TouchableOpacity>)
        }
        else{
          var body = props.currentMessage.replyBody;
          var trimmedString;
          if(body && body.length > 0){
            trimmedString =body.substring(0, 60);
          }
          return (
            <TouchableOpacity onPress={() => this.goToHistory(props.currentMessage)} onLongPress={() => this.LongPress(props.currentMessage)} style={{alignItems: 'flex-start', left: 0, marginBottom: 25}}>
            <View style={[this.props.containerStyle,{maxWidth: '85%', minWidth: '78%'}]}>
              <View>
                <View style={this.state.DarkTheme ? {backgroundColor: '#737373', borderRadius: 10}:{backgroundColor: '#fff', borderRadius: 10, borderColor: '#fff', borderWidth: 1}}>
                  <View style={{flexDirection: 'row',}}>
                    <View style={{ padding: 5, flex: 1, }}>
                        <View style={{width: 5, backgroundColor: '#FF917E', borderTopLeftRadius: 15,}} />
                        <View style={{flex: 1,flexDirection: 'column', backgroundColor: "#fff", color: '#000', marginRight: 0, borderRadius: 5, borderColor:'#FF917E', borderLeftWidth:5}}>
                          <Text style={{color: '#FF917E', paddingTop: 5, fontSize: 12, paddingLeft: 5, paddingRight: 5}}>{props.currentMessage.replyUsername}</Text>
                          <Text style={{color: '#000',  paddingTop: 5, paddingLeft: 5, paddingRight: 5, fontSize: 12, lineHeight: 22}}>{trimmedString}</Text>
                          <Text style={{color: '#FF917E',  paddingTop: 5, paddingLeft: 5, paddingRight: 5, fontSize: 12, lineHeight: 22}}>click to read full conversation</Text>
                        </View>
                      </View>
                    </View>
                    <View style={{flexDirection: 'column'}}>
                        <Text style={this.state.DarkTheme ? {color: '#fff', paddingHorizontal: 10, paddingTop: 5,fontSize: 15,lineHeight:28,marginTop: 10}:
                        {color: '#000', paddingHorizontal: 10, paddingTop: 5, fontSize: 15,lineHeight:28,marginTop: 10}}>{props.currentMessage.text}</Text>
                    </View>
                </View>
              </View>
              <LikeButton currentMessage={props.currentMessage} DarkTheme={this.state.DarkTheme}/>
            </View>
            </TouchableOpacity>)
        }
      }      
      else if(props && props.currentMessage && props.currentMessage.attachments){
        return (
            <View style={{maxWidth: '80%'}}>
            <Bubble
                {...props}
                wrapperStyle={this.state.DarkTheme ?
                {
                    left: {
                        backgroundColor: 'transparent',
                        marginLeft: 10
                    },
                    right:{
                      backgroundColor: 'transparent',
                      marginRight: 10
                    }
                }:                
                {
                    left: {
                        backgroundColor: 'transparent',
                        marginLeft: 10
                    },
                    right:{
                      backgroundColor: 'transparent',
                      marginRight: 10
                    }
                }}
                textStyle={this.state.DarkTheme ?
                {
                    right: {
                        color: '#fff',
                        fontSize: 17
                    },
                    left: {
                        color: '#fff',
                        fontSize: 17
                    }
                }:                
                {
                    right: {
                        color: '#444',
                        fontSize: 17
                    },
                    left: {
                        color: '#000',
                        fontSize: 17
                    }
                }}
            /><LikeButton currentMessage={props.currentMessage} DarkTheme={this.state.DarkTheme}/></View>
         );        
      }
        return (
          <View style={{maxWidth: '85%'}}>
            <Bubble
                {...props}
                wrapperStyle={this.state.DarkTheme ?
                {
                    left: {
                        backgroundColor: '#737373',
                    },
                    right:{
                      backgroundColor: '#fff',

                    }
                }:                
                {
                    left: {
                        backgroundColor: '#fff', borderColor: '#fff', borderWidth: 1
                    },
                    right:{
                      backgroundColor: '#0084FF', borderColor: '#0084FF', borderWidth:1,
                    }
                }}
                textStyle={this.state.DarkTheme ? 
                {
                    right: {
                        color: '#000',
                        fontSize: 15,
                        lineHeight:28,
                    },
                    left: {
                        color: '#fff',
                        fontSize: 15,
                        lineHeight:28,
                    }
                }:                
                {
                    right: {
                        color: '#fff',
                        fontSize: 15,lineHeight:28,
                    },
                    left: {
                        color: '#000',
                        fontSize: 15,
                        lineHeight:28,
                    }
                }}
            /><LikeButton currentMessage={props.currentMessage} DarkTheme={this.state.DarkTheme}/>
          </View>
        );
    }
    isTop(e){
      this.props.increaseParentCount() 
    }    

    getMoreMessages(){
      this.setState({
        getMoreMessages: true, 
        messageCount: this.state.messageCount + 10
      })
      var skip = this.state.skip;
      if( this.state.masterList && (this.state.messageCount + 53) > this.state.masterList.length && this.state.masterList.length < this.state.maxCount){
        //this.props.increaseParentCount() 
        skip = skip + 1;
        var self = this;
        Meteor.call("getSubThreadHistory", this.props.subId, skip, this.props.groupId, function(err, res){
          if(res){
            var tmp = self.state.masterList.concat(res)
            var sort = _.sortBy(tmp, function(tmp) {return -tmp.createdAt;});
            self.setState({
              skip: skip,
              masterList: tmp,
              messageCount: self.state.messageCount + 10
            })
          }
        })        
      }
      this.setState({
        getMoreMessages: false,  
      })
    }
    
    onSend(messages1){
      var urlRegex = /(https?:\/\/[^ ]*)/;
      var text = this.state.text;
      var msg = text;
      if(msg){
          msg = msg.replace(/^\s+|\s+$/g, "");
      }
      if(msg && msg.length > 0){
        var self = this;
        if(this.state.reply){
          Meteor.call('subThreadAddMsg', this.props.subId, text, true, this.state.currentMessage);    
          self.setState({
            reply: null,
            currentMessage: null
          })
        }else{
          Meteor.call('subThreadAddMsg', this.props.subId, text, function(err,result){
          });
        }
        this.setState({text:null, androidAutoCorrectFix: Platform.OS !== 'android'})
        Platform.OS === 'android' && (() => this.setState({androidAutoCorrectFix: true}))
      }
    }

    LongPress(currentMessage) {
      var adminAccess, id;
      var user = Meteor.user();
      var self = this;
      if(currentMessage && currentMessage.user && currentMessage.user._id == Meteor.userId() || user && user.roles  && user.roles.indexOf("admin") > -1){  
        self.showActionSheet3(currentMessage)
      }else{
        self.showActionSheet4(currentMessage)        
      }           

    }   
    renderInputToolbar (props) {
        return <InputToolbar {...props} containerStyle={styles.inputToolbar} />
    }    
    closeGifModal(gifurl){
        this.setState({
          is_gif_modal_visible: null,
          query: null
        })   
        if(gifurl){
          var self = this;
          Meteor.call('sendFileSubthreadMsgGIFF',gifurl,this.props.subId);
        }
 
    }    
    searchGifs = async (query) => {
      this.setState({
        query: query,
      });      
      if(query || query.length > 0){
        const search_results = await searchGifs(query);
        this.setState({
          search_results: search_results,
        });          
      }else{
        this.setState({
          search_results: null,
          query: null,
        });          
      }
    }        
    requestAccess(){
      Meteor.call('requestMeetupAccess',this.props.groupId);  
      this.setState({
        requestedAccessSent: true
      })
    }  
    joinGroup(){
      Meteor.call('joinAddMember',this.props.groupId);  
    } 
    isCloseToTop({ layoutMeasurement, contentOffset, contentSize }) {
      const paddingToTop = 20;
      return contentSize.height - layoutMeasurement.height - paddingToTop <= contentOffset.y;
    }
    renderInputToolbar (props) {
      return <View style={this.state.DarkTheme ? styles.darktabBarInfoContainer: styles.tabBarInfoContainer} keyboardShouldPersistTaps={'never'}>
          <View style={this.state.DarkTheme ? {backgroundColor: '#161616',flexDirection: 'row',
            		alignItems: 'center',
            		flexGrow: 0, marginTop:3}: {flexDirection: 'row',
            		alignItems: 'center',
            		flexGrow: 0, marginTop:3}}>
                <View style={{flexDirection: 'row', bottom:0,right:0,top: 0, left: -5}}>
                  <View>
                    <View style={styles.btnSend}>
                      <Button
                      buttonStyle={{width: 50,alignSelf: 'flex-end', marginTop: 0}}
                      titleStyle={{color: "#0084FF"}}
                      type="clear"
                      icon={
                        <Icon2
                          name="ios-attach"
                          size={20}
                          color="#0084FF"
                        />
                      }
                      onPress={this.showActionSheet2}
                      />
                    </View>
                  </View>
                </View>            		
                <TextInput
                {...props}
                multiline={true}
                placeholderTextColor="#444"
                onChangeText={(val) => { this.setState({ text: val }) }}
                style={this.state.DarkTheme ?
                [{textAlignVertical: 'center', color: "#fff",
                    		maxHeight: 242,
                    		flexGrow: 1,
                    		width: 1,
                    		// paddingVertical: 12, needs to be paddingTop/paddingBottom because of iOS/Android's TextInput differences on rendering
                    		paddingTop: 12,
                    		paddingBottom: 12,
                    		paddingLeft: 0,
                    		paddingRight: 0,
                    		fontSize: 17,
		                    letterSpacing: 0}] :               
                [{textAlignVertical: 'center',
                    		maxHeight: 242,
                    		flexGrow: 1,
                    		width: 1,
                    		// paddingVertical: 12, needs to be paddingTop/paddingBottom because of iOS/Android's TextInput differences on rendering
                    		paddingTop: 12,
                    		paddingBottom: 12,
                    		paddingLeft: 0,
                    		paddingRight: 0,
                    		fontSize: 17,
		                    letterSpacing: 0}]}
                value={this.state.text} />
                <View style={{flexDirection: 'row', bottom:0,right:0,top: 0}}>
                  <TouchableOpacity   onPress={() => this.setState({ is_gif_modal_visible: true })}>
                    <Text style={{ color: '#c2c2c2', marginTop:5 }}>GIF</Text>
                  </TouchableOpacity>
                  <View>
                    <View style={styles.btnSend}>
                      <Button
                      buttonStyle={{width: 50,alignSelf: 'flex-end', marginTop: 0}}
                      titleStyle={{color: "#0084FF"}}
                      type="clear"
                      icon={
                        <Icon2
                          name="md-send"
                          size={20}
                          color="#0084FF"
                        />
                      }
                      onPress={this.onSend}
                      />
                    </View>
                  </View>
                </View>   
            </View> 
        </View>

    }  
    dismissReply(){
      this.setState({
        reply: null
      })
    }    
    renderChatFooter(){
      var name, message;
      if(this.state.currentMessage && this.state.currentMessage.user){
        name = this.state.currentMessage.user.name
      }
      if(this.state.currentMessage && this.state.currentMessage.text && this.state.currentMessage.text.length > 1){
        message = this.state.currentMessage.text;
        var trimmedString = message.substring(0, 30);
        message = trimmedString;
      }else{
        message = "image/video"
      }
      if(this.state.reply){
        return(<View style={this.state.DarkTheme ? {height: 70, flexDirection: 'row', borderTopColor: '#161616',backgroundColor: '#161616',}:
        {height: 70, flexDirection: 'row', borderTopColor: '#eeeeee', borderTopWidth: 1, backgroundColor: '#ffffff', paddingBottom: 10}}>
          <View style={{height:70, width: 5, backgroundColor: 'red'}}></View>
          <View style={{flexDirection: 'column'}}>
              <Text style={{color: 'red', paddingLeft: 10, paddingTop: 5}}>{name}</Text>
              <Text style={this.state.DarkTheme ? {color: '#fff', paddingLeft: 10, paddingTop: 5}:{color: '#444', paddingLeft: 10, paddingTop: 5}}>{message}</Text>
          </View>
          <View style={{flex: 1,justifyContent: 'center',alignItems:'flex-end', paddingRight: 10}}>
              <TouchableOpacity onPress={this.dismissReply}>
                  <Icon2 name="ios-close-circle" size={30} color="#0084FF" />
              </TouchableOpacity>
          </View>
        </View> )    
      }
      return (<View />)
    }    
    render() {
      var list = new Array();
      var deletedlist = this.state.deleted;
      var liked = this.state.liked;
      var masterList = new Array();
      var userId = Meteor.userId();
      var user = Meteor.user();
      var iphonx;
      
      if(isIphoneX() == true){
      	iphonx = true;
      }

      if(this.props.messages){
        for(var i = 0; i < this.props.messages.length; i++){
          masterList.push(this.props.messages[i])
        }
      }
      var blocked, tmp;
      var obj = this.state.subThread;
      if(obj && obj[0]){
          tmp = obj[0].blocklist;
          if(tmp){
             if(tmp.includes(Meteor.userId()) == true){
              blocked = true; 
             }
          }
      }      

      if(this.state.masterList && this.state.masterList){
        for(var i = (this.props.messages.length); i < (this.state.masterList.length + 1); i++){
          var image, video, attachments, avatar;
          if(masterList && this.state.masterList && this.state.masterList[i] && deletedlist.indexOf(this.state.masterList[i]._id) < 0 && _.filter(masterList,{_id:this.state.masterList[i]._id}).length < 1){
            if(this.state.masterList[i] && this.state.masterList[i].attachments && this.state.masterList[i].attachments[0]){
              attachments = this.state.masterList[i].attachments[0];
            }
            if(this.state.masterList[i] && this.state.masterList[i].attachments &&  this.state.masterList[i].attachments[0] && this.state.masterList[i].attachments[0].image_url){
              image = this.state.masterList[i].attachments[0].image_url;
            }
            if(this.state.masterList[i] && this.state.masterList[i].attachments &&  this.state.masterList[i].attachments[0] && this.state.masterList[i].attachments[0].video_url){
              video = this.state.masterList[i].attachments[0].video_url;
            }   
            if(this.state.masterList[i] && this.state.masterList[i].avatar &&  this.state.masterList[i].avatar.avatar){
              avatar = this.state.masterList[i].avatar.avatar.image_url;
            }      
            var vidposter;
            if(this.state.masterList[i] && this.state.masterList[i].videoPosterImage){
              vidposter = this.state.masterList[i].videoPosterImage.image_url;
            }else if(this.state.masterList[i] && this.state.masterList[i].videoImage){
              vidposter = this.state.masterList[i].videoImage.image_url;
            }                   
            var message = {
              _id: this.state.masterList[i]._id,
              attachments: attachments,
              createdAt: this.state.masterList[i].createdAt,
              image: image,    
              text: this.state.masterList[i].body,
              user:{
                _id: this.state.masterList[i].userId,
                name: this.state.masterList[i].username,
              },
              video: video,
              avatar:avatar,
              videoImage:vidposter,
              methodSource:true,
              reply: this.state.masterList[i].reply,
              replyBody: this.state.masterList[i].replyBody,
              replyattachments: this.state.masterList[i].replyattachments,   
              replyUsername: this.state.masterList[i].replyUsername,
              replyUserId: this.state.masterList[i].replyUserId,
              likedByUsername: this.state.masterList[i].likedByUsername,
              _likeCount: this.state.masterList[i]._likeCount,
              replyId: this.state.masterList[i].replyId
            }
            masterList.push(message);
            image = null, video = null, attachments = null, avatar=null;
          }
        }
      }

      if(masterList){
          for(var i=0; i < this.state.messageCount; i++){
            if(masterList[i] && deletedlist && deletedlist.indexOf(masterList[i]._id) < 0){
                list.push(masterList[i])
            }      
          }
      }
      
      var requestedAccess, privatePage, access;
      var requestlist = this.state.meetupRequests;
      if(requestlist){
        _.forEach(requestlist, function(obj){
          if(obj.userId == userId){
            requestedAccess = true;  
          }
        })   
      }      
      if(this.state.meetupObj && this.state.meetupObj[0]){
        privatePage = this.state.meetupObj[0].privatePage;
      }
      if(requestlist){
        _.forEach(requestlist, function(obj){
          if(obj.userId == userId){
            requestedAccess = true;  
          }
        })   
      }
      if(this.state.requestedAccessSent == true){
        requestedAccess = true;
      }
      var members = this.state.meetupMembers;
      if(members){

        _.each(members, function(obj){
          if(obj.userId == userId){
            access = true;
          }
        })
        if(this.state.meetupObj && this.state.meetupObj[0] && this.state.meetupObj[0].userId == userId){
          access = true;   
        }           
      }else{
        if(this.state.meetupObj && this.state.meetupObj[0] && this.state.meetupObj[0].userId == userId){
          access = true;   
        }
      }     
      var dataReady, avatar, username, messagesReady;
      var text;
      if(this.state.text == null){
        text = 'start writing...'
      }
      var userId = Meteor.userId();
      var user = Meteor.user();
      if(user){
        username = user.username;
      }
      if(user && user.avatar){
        avatar = user.avatar.image_url;
      }
      if(this.props.conversations != null){
        dataReady = true;
      }
      if(this.props.messages != null) {
        messagesReady = true;    
      }
      if(masterList == null || masterList && masterList.length < 1){
        <View style={this.state.DarkTheme ? {flex: 1, backgroundColor: '#161616'} : { flex: 1, backgroundColor: '#EEF5FF'}}
          collapsable={Platform.OS === 'android' ? false: true}>  
          <GiftedChat
            textInputProps={{
                autoCorrect: Platform.OS === 'ios' || this.state.androidAutoCorrectFix
            }}  
            listViewProps={{
                onEndReached:  () => { 
                  if(this.onEndReachedCalledDuringMomentum == false) {
                    this.getMoreMessages()
                    this.onEndReachedCalledDuringMomentum = true;
                  }
                },
                onEndReachedThreshold: 0.1,
                onMomentumScrollBegin: ({ }) => { this.onEndReachedCalledDuringMomentum = false; }
            }}      
            style={this.state.DarkTheme ? {flex: 1, backgroundColor: '#161616'} : {flex: 1, backgroundColor: '#EEF5FF'}}
            placeholder={text}
            text={this.state.text} 
            keyboardShouldPersistTaps={'never'}
            messages={list}
            onSend={messages => this.onSend(messages)}
            showUserAvatar={true}
            showAvatarForEveryMessage={true}
            renderUsernameOnMessage={true}
            isLoadingEarlier={this.state.getMoreMessages} 
            onInputTextChanged={text => this.setState({ text })}
            renderInputToolbar={this.renderInputToolbar}
            onLongPress ={(ctx, currentMessage) => this.LongPress(currentMessage)}
            renderAvatar={obj => this.renderItem(obj)}
            renderBubble={obj =>  this.renderBubble(obj)}
            renderMessageImage={obj => this.renderImage(obj)} 
            renderMessageVideo={obj => this.renderVideo(obj)}
            renderChatFooter={this.renderChatFooter}
            parsePatterns={item => [{
              type: 'url',
              style: item && item[0].color === 'black' ? [styles.blueLink, {textDecorationLine: 'underline'}] : [styles.blueLink, {textDecorationLine: 'underline'}],
              onPress: this.handleUrlPress,
            }, {
              type: 'email',
              style: item && item[0].color === 'black' ? [styles.blueLink, {textDecorationLine: 'underline'}] : [styles.blueLink, {textDecorationLine: 'underline'}],
              onPress: this.handleEmailPress,
            }]}     
            timeTextStyle={this.state.DarkTheme ? { left: { color: '#c2c2c2' },right: { color:'#469A10'} } : { left: { color: 'tomato' },right: { color:'#fff'} }}
            user={{
              _id: userId,
              name: username,
              avatar: avatar,
            }}
          />
        </View>
      }      
      else if(this.props.blocked == true ){
      return (
        <View style={styles.loadMoreHistorycontainer}>
              <Text style={[{color:"#1F2225", fontSize:18, fontWeight: '200', marginLeft:0, marginTop: 3}]}>
                  You have been blocked.
              </Text> 
        </View>);      
      }      
      else if(this.props.privatePage == true && this.props.access != true){
        return(
          <View style={this.state.DarkTheme ? [styles.fill, {backgroundColor:"#161616"}] : [styles.fill, {backgroundColor:"#ffffff"}]}>
            <View style={[ {marginTop: 30, marginLeft: 20, marginRight: 20}]}>
                <Text style={[{color:"#1F2225", fontSize:18, fontWeight: '200', marginLeft:0, marginTop: 0}]}>
                    This Page is Private 
                </Text> 
                <Text style={[{color:"#1F2225", fontSize:18, fontWeight: '200', marginLeft:0, marginTop: 10, }]}>
                   {"\n"} {"\n"}
                </Text>               
                {requestedAccess  ?  
                <Text style={{color:"#1F2225", fontSize:18, fontWeight: '200', marginLeft:0, marginTop: 10}}>
                  You have already quested access!
                </Text> : <Button
                  buttonStyle={styles.loginButton}
                  onPress={() => this.requestAccess()}
                  title="Request Access"
                />          
                }             
            </View>     
          </View>
        )      
      }    
      else if(this.props.groupId  && this.props.access != true){
        return(
          <View style={this.state.DarkTheme ? [styles.fill, {backgroundColor:"#161616"}] :[styles.fill, {backgroundColor:"#ffffff"}]}>
            <View style={[{marginTop: 20, marginLeft: 20, marginRight: 20}]}>
                <Text style={[{color:"#1F2225", fontSize:18, fontWeight: '200', marginLeft:0, marginTop: 3}]}>
                    Join this group
                </Text> 
                <Button
                  buttonStyle={{backgroundColor: '#0084FF', marginTop: 10 }}
                  onPress={() => this.joinGroup()}
                  title="Join"
                />         
            </View>     
          </View>
        )      
      }   
      else if(Platform.OS === 'ios'){
        return(
          <KeyboardAvoidingView style={this.state.DarkTheme ? {flexGrow:1,height:'100%', backgroundColor: '#161616'} : {flexGrow:1,height:'100%',backgroundColor: '#EEF5FF'}} > 
          <GiftedChat
            textInputProps={{
                autoCorrect: Platform.OS === 'ios' || this.state.androidAutoCorrectFix
            }} 
            listViewProps={{
                onEndReached:  () => { 
                  if(this.onEndReachedCalledDuringMomentum == false) {
                    this.getMoreMessages()
                    this.onEndReachedCalledDuringMomentum = true;
                  }
                },
                onEndReachedThreshold: 0.1,
                onMomentumScrollBegin: ({ }) => { this.onEndReachedCalledDuringMomentum = false; }
            }}    
            style={this.state.DarkTheme ? {flex: 1, backgroundColor: '#161616'} : {flex: 1, backgroundColor: '#EEF5FF'}}
            placeholder={text}
            text={this.state.text}
            renderUsernameOnMessage={true}
            keyboardShouldPersistTaps={'never'}
            messages={list}
            onSend={messages => this.onSend(messages)}
            showUserAvatar={true}
            showAvatarForEveryMessage={true}
            isLoadingEarlier={this.state.getMoreMessages}
            onInputTextChanged={text => this.setState({ text })}
            renderInputToolbar={this.renderInputToolbar}
            onLongPress ={(ctx, currentMessage) => this.LongPress(currentMessage)}
            renderAvatar={obj => this.renderItem(obj)}
            renderBubble={obj =>  this.renderBubble(obj)}
            renderMessageImage={obj => this.renderImage(obj)} 
            renderMessageVideo={obj => this.renderVideo(obj)}
            renderChatFooter={this.renderChatFooter}
            parsePatterns={item => [{
              type: 'url',
              style: item && item[0].color === 'black' ? [styles.blueLink, {textDecorationLine: 'underline'}] : [styles.blueLink, {textDecorationLine: 'underline'}],
              onPress: this.handleUrlPress,
            }, {
              type: 'email',
              style: item && item[0].color === 'black' ? [styles.blueLink, {textDecorationLine: 'underline'}] : [styles.blueLink, {textDecorationLine: 'underline'}],
              onPress: this.handleEmailPress,
            }]}              
            timeTextStyle={this.state.DarkTheme ? { left: { color: '#c2c2c2' },right: { color:'#469A10'} } : { left: { color: 'tomato' },right: { color:'#fff'} }}
            user={{
              _id: userId,
              name: username,
              avatar: avatar,
            }}
          />
          <ActionSheet
            ref={o => this.ActionSheet = o}
            title={'Delete ?'}
            options={['Delete', 'Copy', 'cancel']}
            cancelButtonIndex={2}
            destructiveButtonIndex={1}
            onPress={(index, data) => { 
              if(index == 0){
                if(this.state.currentMessage){
                  Meteor.call('subThreadDeleteMsg',this.state.currentMessage._id);
                  var arr = this.state.deleted;
                  arr.push(this.state.currentMessage._id);
                  this.setState({
                    currentMessage: null,
                    deleted: arr
                  })                  
                }
              }else if(index == 1){
                if(this.state.currentMessage){
                  Clipboard.setString(this.state.currentMessage.text);
                  this.setState({
                    currentMessage: null,
                  })                 
                }
              }            
              
            }}
          />
          <ActionSheet
            ref={o => this.ActionSheet2 = o}
            title={'Options'}
            options={['Image', 'Video', 'Cancel']}
            cancelButtonIndex={2}
            destructiveButtonIndex={3}
            onPress={(index) => { 
              if(index == 0){
                this._pickImage()
              }else if(index == 1){
                this._pickVideo() 
              }
            }}
          />  
          <ActionSheet
            ref={o => this.ActionSheet3 = o}
            title={'Options'}
            options={['Save','Reply', 'Like', 'Copy','Delete',  'cancel']}
            cancelButtonIndex={5}
            destructiveButtonIndex={4}
            onPress={(index, data) => {
              if(index == 0){
                if(this.state.currentMessage){
                  Meteor.call('subThreadMessageSave',this.state.currentMessage._id);
                  this.setState({
                    currentMessage: null
                  })
                }
              }        
              else if(index == 1){
                if(this.state.currentMessage){
                  this.setState({
                    reply: true
                  })    
                }
              }      
              else if(index == 2){
                if(this.state.currentMessage){
                  var user = Meteor.user();
                  Meteor.call('subThreadMessageLike',this.state.currentMessage._id);
                  var list = this.state.masterList;
                  if(list){
                    for(var i = 0; i < list.length; i++){
                      if(list[i] && list[i]._id == this.state.currentMessage._id){
                        var arr = list[i].likedByUsername;
                        if(arr){
                          arr.push(user.username)
                        }else{
                          arr = [user.username]
                        }
                        
                        var likecount = list[i]._likeCount;
                        if(likecount > 0){
                          likecount = likecount + 1;
                        }else{
                          likecount = 1;
                        }
                                    
                        list[i].likedByUsername = arr;
                        list[i]._likeCount = likecount
                      }
                    }
                  }
                  this.setState({masterList: list})
                }
              }    
              else if(index == 3){
                if(this.state.currentMessage){
                  Clipboard.setString(this.state.currentMessage.text);
                  this.setState({
                    currentMessage: null,
                  })                 
                }                
              }              
              else if(index == 4){
                if(this.state.currentMessage){
                  Meteor.call('subThreadDeleteMsg',this.state.currentMessage._id);
                  var arr = this.state.deleted;
                  arr.push(this.state.currentMessage._id);
                  this.setState({
                    currentMessage: null,
                    deleted: arr
                  }) 
                }
              }            
              
            }}
          />  
          <ActionSheet
            ref={o => this.ActionSheet4 = o}
            title={'Options'}
            options={['Save','Reply','Like','Copy','Hide and report this message',  'cancel']}
            cancelButtonIndex={5}
            destructiveButtonIndex={4}
            onPress={(index, data) => { 
              if(index == 0){
                if(this.state.currentMessage){
                  Meteor.call('subThreadMessageSave',this.state.currentMessage._id);
                  this.setState({
                    currentMessage: null
                  })                  
                }
              }              
              else if(index == 1){
                if(this.state.currentMessage){
                  this.setState({
                    reply: true
                  })    
                }                
              }
              else if(index == 2){
                if(this.state.currentMessage){
                  var user = Meteor.user();
                  Meteor.call('subThreadMessageLike',this.state.currentMessage._id);
                  var list = this.state.masterList;
                  if(list){
                    for(var i = 0; i < list.length; i++){
                      if(list[i] && list[i]._id == this.state.currentMessage._id){
                        var arr = list[i].likedByUsername;
                        if(arr){
                          arr.push(user.username)
                        }else{
                          arr = [user.username]
                        }
                        
                        var likecount = list[i]._likeCount;
                        if(likecount > 0){
                          likecount = likecount + 1;
                        }else{
                          likecount = 1;
                        }
                                    
                        list[i].likedByUsername = arr;
                        list[i]._likeCount = likecount
                      }
                    }
                  }
                  this.setState({masterList: list})
                }
              }  
              else if(index == 3){
                if(this.state.currentMessage){
                  Clipboard.setString(this.state.currentMessage.text);
                  this.setState({
                    currentMessage: null,
                  })                 
                }                
              }
              else if(index == 4){
                if(this.state.currentMessage){
                  Meteor.call('hideChatMessageSub',this.state.currentMessage._id);
                  var arr = this.state.deleted;
                  arr.push(this.state.currentMessage._id);
                  this.setState({
                    currentMessage: null,
                    deleted: arr
                  }) 
                }
              }            
              
            }}
          />             
          <Modal visible={this.state.is_gif_modal_visible}>
            <SafeAreaView  style={{flex:1, backgroundColor: '#161616'}} forceInset={{ top: 'never'}}>    
              <View style={{ flex: 1, backgroundColor: '#161616' }}>
                  <View>
                    <TouchableHighlight
                        onPress={() => {
                          this.setModalVisible(!this.state.is_gif_modal_visible);
                    }}>
                        <Text style={{fontSize: 30, color: '#FFFFFF'}}>Close</Text>
                    </TouchableHighlight>
                    <GiphySearch
                      query={this.state.query}
                      onSearch={(query) => this.searchGifs(query)}
                      search={this.searchGifs}
                      search_results={this.state.search_results}
                      onPick={(gif_url) => this.closeGifModal(gif_url)} />                               
                </View>
              </View>
            </SafeAreaView>            
          </Modal> 
          {iphonx ? <KeyboardSpacer topSpacing={-40}/>: <KeyboardSpacer topSpacing={0}/>}
        </KeyboardAvoidingView >
        
        )         
      }
      return (
        <KeyboardAvoidingView 
                  style={this.state.DarkTheme ? {flexGrow: 1, backgroundColor: '#161616'} : { flexGrow: 1, backgroundColor: '#EEF5FF'}}
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} >  
          <GiftedChat
            textInputProps={{
                autoCorrect: Platform.OS === 'ios' || this.state.androidAutoCorrectFix
            }}  
            listViewProps={{
                onEndReached:  () => { 
                  if(this.onEndReachedCalledDuringMomentum == false) {
                    this.getMoreMessages()
                    this.onEndReachedCalledDuringMomentum = true;
                  }
                },
                onEndReachedThreshold: 0.1,
                onMomentumScrollBegin: ({ }) => { this.onEndReachedCalledDuringMomentum = false; }
            }}      
            style={this.state.DarkTheme ? {flex: 1, backgroundColor: '#161616'} : {flex: 1, backgroundColor: '#EEF5FF'}}
            placeholder={text}
            text={this.state.text} 
            keyboardShouldPersistTaps={'never'}
            messages={list}
            onSend={messages => this.onSend(messages)}
            showUserAvatar={true}
            showAvatarForEveryMessage={true}
            renderUsernameOnMessage={true}
            isLoadingEarlier={this.state.getMoreMessages} 
            onInputTextChanged={text => this.setState({ text })}
            renderInputToolbar={this.renderInputToolbar}
            onLongPress ={(ctx, currentMessage) => this.LongPress(currentMessage)}
            renderAvatar={obj => this.renderItem(obj)}
            renderBubble={obj =>  this.renderBubble(obj)}
            renderMessageImage={obj => this.renderImage(obj)} 
            renderMessageVideo={obj => this.renderVideo(obj)}
            renderChatFooter={this.renderChatFooter}
            parsePatterns={item => [{
              type: 'url',
              style: item && item[0].color === 'black' ? [styles.blueLink, {textDecorationLine: 'underline'}] : [styles.blueLink, {textDecorationLine: 'underline'}],
              onPress: this.handleUrlPress,
            }, {
              type: 'email',
              style: item && item[0].color === 'black' ? [styles.blueLink, {textDecorationLine: 'underline'}] : [styles.blueLink, {textDecorationLine: 'underline'}],
              onPress: this.handleEmailPress,
            }]}     
            timeTextStyle={this.state.DarkTheme ? { left: { color: '#c2c2c2' },right: { color:'#469A10'} } : { left: { color: 'tomato' },right: { color:'#fff'} }}
            user={{
              _id: userId,
              name: username,
              avatar: avatar,
            }}
          />
          <ActionSheet
            ref={o => this.ActionSheet = o}
            title={'Which one do you like ?'}
            options={['Delete', 'Copy', 'cancel']}
            cancelButtonIndex={2}
            destructiveButtonIndex={1}
            onPress={(index, data) => { 
              if(index == 0){
                if(this.state.currentMessage){
                  Meteor.call('subThreadDeleteMsg',this.state.currentMessage._id);
                  var arr = this.state.deleted;
                  arr.push(this.state.currentMessage._id);
                  this.setState({
                    currentMessage: null,
                    deleted: arr
                  })    
                }
              }else if(index == 1){
                if(this.state.currentMessage){
                  Clipboard.setString(this.state.currentMessage.text);
                  this.setState({
                    currentMessage: null,
                  })                 
                }
              }            
              
            }}
          />
          <ActionSheet
            ref={o => this.ActionSheet2 = o}
            title={'Options'}
            options={['Image', 'Video', 'Cancel']}
            cancelButtonIndex={2}
            destructiveButtonIndex={3}
            onPress={(index) => { 
              if(index == 0){
                this._pickImage()
              }else if(index == 1){
                this._pickVideo() 
              }
            }}
          />        
          <ActionSheet
            ref={o => this.ActionSheet3 = o}
            title={'Options'}
            options={['Save','Reply', 'Like', 'Copy','Delete',  'cancel']}
            cancelButtonIndex={5}
            destructiveButtonIndex={4}
            onPress={(index, data) => {
              if(index == 0){
                if(this.state.currentMessage){
                  Meteor.call('subThreadMessageSave',this.state.currentMessage._id);
                  this.setState({
                    currentMessage: null
                  })
                }
              }        
              else if(index == 1){
                if(this.state.currentMessage){
                  this.setState({
                    reply: true
                  })    
                }
              }      
              else if(index == 2){
                if(this.state.currentMessage){
                  var user = Meteor.user();
                  Meteor.call('subThreadMessageLike',this.state.currentMessage._id);
                  var list = this.state.masterList;
                  if(list){
                    for(var i = 0; i < list.length; i++){
                      if(list[i] && list[i]._id == this.state.currentMessage._id){
                        var arr = list[i].likedByUsername;
                        if(arr){
                          arr.push(user.username)
                        }else{
                          arr = [user.username]
                        }
                        
                        var likecount = list[i]._likeCount;
                        if(likecount > 0){
                          likecount = likecount + 1;
                        }else{
                          likecount = 1;
                        }
                                    
                        list[i].likedByUsername = arr;
                        list[i]._likeCount = likecount
                      }
                    }
                  }
                  this.setState({masterList: list})
                }
              }    
              else if(index == 3){
                if(this.state.currentMessage){
                  Clipboard.setString(this.state.currentMessage.text);
                  this.setState({
                    currentMessage: null,
                  })                 
                }                
              }              
              else if(index == 4){
                if(this.state.currentMessage){
                  Meteor.call('subThreadDeleteMsg',this.state.currentMessage._id);
                  var arr = this.state.deleted;
                  arr.push(this.state.currentMessage._id);
                  this.setState({
                    currentMessage: null,
                    deleted: arr
                  }) 
                }
              }            
              
            }}
          />  
          <ActionSheet
            ref={o => this.ActionSheet4 = o}
            title={'Options'}
            options={['Save','Reply','Like','Copy','Hide and report this message',  'cancel']}
            cancelButtonIndex={5}
            destructiveButtonIndex={4}
            onPress={(index, data) => { 
              if(index == 0){
                if(this.state.currentMessage){
                  Meteor.call('subThreadMessageSave',this.state.currentMessage._id);
                  this.setState({
                    currentMessage: null
                  })                  
                }
              }              
              else if(index == 1){
                if(this.state.currentMessage){
                  this.setState({
                    reply: true
                  })    
                }                
              }
              else if(index == 2){
                if(this.state.currentMessage){
                  var user = Meteor.user();
                  Meteor.call('subThreadMessageLike',this.state.currentMessage._id);
                  var list = this.state.masterList;
                  if(list){
                    for(var i = 0; i < list.length; i++){
                      if(list[i] && list[i]._id == this.state.currentMessage._id){
                        var arr = list[i].likedByUsername;
                        if(arr){
                          arr.push(user.username)
                        }else{
                          arr = [user.username]
                        }
                        
                        var likecount = list[i]._likeCount;
                        if(likecount > 0){
                          likecount = likecount + 1;
                        }else{
                          likecount = 1;
                        }
                                    
                        list[i].likedByUsername = arr;
                        list[i]._likeCount = likecount
                      }
                    }
                  }
                  this.setState({masterList: list})
                }
              }  
              else if(index == 3){
                if(this.state.currentMessage){
                  Clipboard.setString(this.state.currentMessage.text);
                  this.setState({
                    currentMessage: null,
                  })                 
                }                
              }
              else if(index == 4){
                if(this.state.currentMessage){
                  Meteor.call('hideChatMessageSub',this.state.currentMessage._id);
                  var arr = this.state.deleted;
                  arr.push(this.state.currentMessage._id);
                  this.setState({
                    currentMessage: null,
                    deleted: arr
                  }) 
                }
              }            
              
            }}
          />       
          <Modal visible={this.state.is_gif_modal_visible}>
            <SafeAreaView  style={{flex:1, backgroundColor: '#161616'}} forceInset={{ top: 'never'}}>    
              <View style={{ flex: 1, backgroundColor: '#161616' }}>
                  <View>
                    <TouchableHighlight
                        onPress={() => {
                          this.setModalVisible(!this.state.is_gif_modal_visible);
                    }}>
                        <Text style={{fontSize: 30, color: '#FFFFFF'}}>Close</Text>
                    </TouchableHighlight>
                    <GiphySearch
                      query={this.state.query}
                      onSearch={(query) => this.searchGifs(query)}
                      search={this.searchGifs}
                      search_results={this.state.search_results}
                      onPick={(gif_url) => this.closeGifModal(gif_url)} />                               
                </View>
              </View>
            </SafeAreaView>            
          </Modal>   
        </KeyboardAvoidingView>
        );
    }

}


export default withTracker(params => {
    var messageCount = params.ListCount;
    var subId = params.subId;
    var groupId = params.groupId;
    var groupAccess, privatePage, requestedAccess, admin, access;
    var userId = Meteor.userId();
    var handler1 = Meteor.subscribe('myuserFields')   
    var handler2 = Meteor.subscribe('SubThread', subId, messageCount);
    var handler3 = Meteor.subscribe('SubThreadDescription', subId)
    if(groupId != null){
      //InteractionManager.runAfterInteractions(() => {  
        var handler4 = Meteor.subscribe('meetupMembers', groupId)
        var handler5 = Meteor.subscribe('meetup', groupId);
        var handler6 = Meteor.subscribe('meetupRequests', groupId)
      //});
      var meetupObj = Meteor.collection("meetup").find({_id:groupId});
      var members = Meteor.collection("meetupMember").find({meetupId:groupId})      
      var requestlist = Meteor.collection("meetupRequest").find({meetupId: groupId});
      if(meetupObj && meetupObj[0]){
      }
      privatePage = true;
      if(requestlist){
        _.forEach(requestlist, function(obj){
          if(obj.userId == userId){
            requestedAccess = true;  
          }
        })   
      }
      if(members){

        _.each(members, function(obj){
          if(obj.userId == userId){
            access = true;
          }
        })
        if(meetupObj && meetupObj[0] && meetupObj[0].userId == userId){
          access = true;   
        }           
      }else{
        if(meetupObj && meetupObj[0] && meetupObj[0].userId == userId){
          access = true;   
        }
      }    

    }
    
    var array = new Array();
    var messages = new Array();
    array = Meteor.collection('subThreadMessage').find({subThreadId:subId}, {sort: {createdAt: -1}});
    _.each(array,function(obj){
      if(obj){
        var image, video, attachments;
        if(obj && obj.attachments && obj.attachments[0]){
          attachments = obj.attachments[0];
        }
        if(obj && obj.attachments &&  obj.attachments[0] && obj.attachments[0].image_url){
          image = obj.attachments[0].image_url;
        }
        if(obj && obj.attachments &&  obj.attachments[0] && obj.attachments[0].video_url){
          video = obj.attachments[0].video_url;
        }     
        
        var user = Meteor.collection("users").find({_id:obj.userId});
        var avatar;
        if(user && user[0] && user[0].avatar){
          avatar = user[0].avatar.image_url;
        }
        var message = {
          _id: obj._id,
          text: obj.body,
          createdAt: obj.createdAt,
          user:{
            _id: obj.userId,
            name: obj.username,
          },
          avatar:avatar,
          image: image,
          video: video,
          attachments: attachments,
          videoImage: obj.videoPosterImage,
          reply: obj.reply,
          replyBody: obj.replyBody,
          replyattachments: obj.replyattachments,   
          replyUsername: obj.replyUsername,
          replyUserId: obj.replyUserId,
          likedByUsername: obj.likedByUsername,
          _likeCount: obj._likeCount,
          replyId: obj.replyId
        }
        messages.push(message);
      }
    })
    var blocked, list;
    var obj = Meteor.collection("subThread").find({_id:subId});
    if(obj && obj[0]){
        list = obj[0].blocklist;
        if(list){
          if(list.includes(Meteor.userId()) == true){
            blocked = true; 
          }
        }
    }
    return {
      messages: messages,
      blocked: blocked,
      subId:subId,
      privatePage:privatePage,
      access: access,
      requestedAccess:requestedAccess,
      groupId:groupId,
      handler1: handler1,
      handler2: handler2,
      handler3: handler3,
      handler4: handler4,
      handler5: handler5,
      handler6: handler6
    };
})(SubThreadItemComp);

const style1 = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  container2: {
    width: 50,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },  
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 15,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
})

const stylez = {
    left: StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            marginLeft: 8,
            marginRight: 0,
        },
    }),
    right: StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            marginLeft: 0,
            marginRight: 8,
        },
    }),
};

const styles = StyleSheet.create({
  socialBarSection: {
    flexDirection: 'row',
    marginTop: 10
  },  
  inputToolbar:{
    height: 50,
    borderTopColor: '#f3f3f3',
    marginTop: 10,
    flexDirection: 'row',
		alignItems: 'center',
		flexGrow: 0
  },
  darktabBarInfoContainer:{
    position: 'absolute',
    maxHeight: 190,
    bottom: 0,
    left: 0,
    right: 0,
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#444444',
    //     shadowOffset: { height: -3 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 3,
    //   },
    //   android: {
    //     elevation: 20,
    //   },
    // }),
    alignItems: 'center',
    borderColor: '#161616',
    borderWidth:1,
    borderTopColor: '#161616',
    backgroundColor: '#161616',
    paddingVertical: 0,
    paddingHorizontal: 0    
  },
  tabBarInfoContainer: {
    position: 'absolute',
    maxHeight: 190,
    bottom: 0,
    left: 0,
    right: 0,
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#444444',
    //     shadowOffset: { height: -3 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 3,
    //   },
    //   android: {
    //     elevation: 20,
    //   },
    // }),
    alignItems: 'center',
    borderColor: '#ffffff',
    borderWidth:1,
    borderTopColor: '#eeeeee',
    backgroundColor: '#ffffff',
    paddingVertical: 0,
    paddingHorizontal: 0
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#f7f7f7',
    borderBottomWidth: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  pic: {
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
  },
  nameTxt: {
    marginLeft: 0,
    fontWeight: '600',
    color: '#222',
    fontSize: 15,

  },
  time: {
    fontWeight: '200',
    color: '#83929E',
    fontSize: 13,
  },
  msgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgTxt: {
    fontWeight: '400',
    color: '#83929E',
    fontSize: 15,
  },  
  fill: {
    flex: 1,
  },  
  usernameInitials: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15
  },  
  cardAvatarlogostyle: {
    height: 52,
    borderRadius: 5,
    width: 52,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    marginTop:0,
  },  
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    height
  },  
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: 120
  },
  fbLoginButton: {
    height: 45,
    marginTop: 10,
    backgroundColor: 'transparent',
    marginLeft: 15,
    marginRight: 15,
  },
  header:{
        backgroundColor: '#c30f42'
    },
    itemHeader:{
        backgroundColor: '#c30f42',
        paddingLeft:10
    },
    iconSearch:{
        color:'white',
        fontSize:20,
        paddingTop:14                                
    },
    iconActive:{
        color:'#c30f42',
        height:27
    },
    header1:{
        fontSize:19,
        paddingTop:25,
        paddingLeft:25,
        paddingBottom:14
    },
    header2:{
        fontSize:19,
        paddingTop:21,
        paddingLeft:25,
        paddingBottom:10
    },
    header3:{
        fontSize:12,
        paddingLeft:25,
        paddingBottom:14,
        color:'black'
    },
    textSearch:{
        color:'white',
        fontWeight:'bold',
    },
    garisBawah:{
        width:'92%',
        color:'white',
        paddingTop:12,
        paddingLeft:5
    },                                             
    textLokasi:{
        color:'white',
    },                                   
    viewItem:{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0, 
        bottom: 0 
    },  
  modalFooter:{
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    height: 54,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 5,
    borderTopColor: '#eeeeee',
  },
  modaHeaderCloseButton:{
    color: "#000000",
    fontSize:28,
  },
  modalImageButton:{
    color: "#000000",
    fontSize:36,
  },
  loadMoreHistorycontainer: {
    flex: 1,
    justifyContent: 'center',
    padding:10,
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  navbar: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: '#2D99F1',
    borderBottomColor: '#dedede',
    borderBottomWidth: 0,
    height: 64,
    justifyContent: "flex-start",
    elevation:8,
    flex: 1, flexDirection: 'row'
    //paddingTop: STATUS_BAR_HEIGHT,
  },
  contentContainer: {
    paddingTop: 0,
    marginLeft:0,
    marginRight:0,
    backgroundColor: '#ffffff',
    paddingBottom:5,
    //paddingBottom:40,
    top: -5,
    marginTop: 0,
  },
  title: {
    color: '#FFF',
    fontWeight:"bold",
  },
  row: {
    height: 300,
    width: null,
    marginBottom: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  rowText: {
    color: 'white',
    fontSize: 18,
  },
  avatar:{
    marginRight:15
  },
  buttonCon:{
    //position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    //alignSelf: 'flex-end',
    //position: 'absolute',
    backgroundColor:'#0084FF',
  },
  buttonPost:{
    //position: 'absolute',
    backgroundColor:'#0084FF',
  //   //width: '100%',
  // // height: 50,
  //   marginTop:300,
  //   top:300,
  //   margin: 16,
  //   right: 0,
  //   bottom: 0,  
  },
  modal: {
    justifyContent: "flex-start",
    alignItems: "center",
    position: "absolute",
    // zIndex: 0,
    // //elevation: 4,
    // height: Dimensions.get("window").height - Constants.statusBarHeight,
    // marginTop: Constants.statusBarHeight / 2
  },
  cardStyle:{
    borderBottomColor: '#eeeeee',
    borderBottomWidth: 1, marginBottom: 0, elevation: 0 , marginTop: 0,
    borderTopColor: '#DDDFE2'
    
  },
  cardStyleComment:{
    borderBottomColor: '#eeeeee',
    borderTopWidth: 0,
    borderBottomWidth:1, marginBottom: 0, elevation: 0 , marginTop: 0,
    flex: 1,
  },  
  cardStyleCommentReply:{
    borderBottomColor: '#f7f7f7',
    borderTopWidth: 0,
    borderBottomWidth:1, marginBottom: 0, elevation: 0 , marginTop: 0,
    flex: 1,
  },  
  cardStyleCommentReplySingle:{
    borderBottomColor: '#eeeeee',
    borderTopWidth: 0,
    borderBottomWidth:1, marginBottom: 0, elevation: 0 , marginTop: 0,
    flex: 1,
  },    
  cardItemStyleMain:{
    flexDirection: 'row'
  },  
});

