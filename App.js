
import React, { useEffect, useState } from 'react';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

import { Audio } from 'expo-av';
//import everything from firebase.. hopefully there won't be any more problems!
import * as firebase from 'firebase';
import { LogBox } from 'react-native';

//to ignore the timer warning... 
LogBox.ignoreLogs(['Setting a timer']);
LogBox.ignoreAllLogs();

import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, StatusBar, Platform, Dimensions, Button, ToastAndroid, AlertIOS } from 'react-native';
import { MEDIA_LIBRARY_WRITE_ONLY } from 'expo-permissions';


//init firebase database
const firebaseConfig = {
  apiKey: "AIzaSyD5qmI5oqt2i5kp5szb7Jqfib4q3CBmEPw",
  authDomain: "mobileproctor-reactnative.firebaseapp.com",
  databaseURL: "https://mobileproctor-reactnative-default-rtdb.firebaseio.com",
  projectId: "mobileproctor-reactnative",
  storageBucket: "mobileproctor-reactnative.appspot.com",
  messagingSenderId: "529635987826",
  appId: "1:529635987826:web:47ad2755c2a6661063cdeb",
  measurementId: "G-YRVD08RP3N"
};



if( firebase.apps.length === 0 ){
  firebase.initializeApp(firebaseConfig);
}



export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [recording, setRecording] = useState(false)

  //working now
  const notify = (message) => {
    if (Platform.OS != 'android') {
        AlertIOS.show({
          text: message,
          duration: AlertIOS.LENGTH_SHORT,
        });

        Snackbar.show({
            text: message,
            duration: Snackbar.LENGTH_SHORT,
        });
    } else {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    }
}




  

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      await Audio.requestPermissionsAsync();
      await MediaLibrary.requestPermissionsAsync();
    
      setHasPermission(status === 'granted');
    })();
  }, []);


  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text alignItems="center" onPress={ask}>Access Denied!</Text>;
  }
  
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{flex: 1}} backgroundColor='white' alignItems="center" justifyContent="center">
        <View style={{flex: 1}}/>
        <Image style={{flex: 2}} height = '50%' width = '50%' source={require('./assets/elit4.png')} />
      </SafeAreaView>
      <Camera style={{ flex: 4 }} type={type} ref={ref => {
        setCameraRef(ref) ;
  }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            justifyContent: 'flex-end'
          }}>
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly'
            }}>
            <TouchableOpacity
            style={{
              flex: 0.2,
              alignSelf: 'flex-end'
            }}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Ionicons name={ Platform.OS === 'ios' ? 'ios-camera-reverse-sharp' : 'md-camera-reverse-sharp'} size={50} color="white" />
            
          </TouchableOpacity>
          <TouchableOpacity style={{alignSelf: 'center'}} onPress={async() => {

            
            console.log("pic taken");
              if (cameraRef) {
                let photo = await cameraRef.takePictureAsync();
                uri = photo.uri;

                uploadImageUrl = await uploadToRemoteServerAsync(uri);

                //store in the phone
                MediaLibrary.createAssetAsync(uri).then(asset => {
                  console.log('asset', asset);
                MediaLibrary.createAlbumAsync('MobileProctor', asset)
                  .then(() => {
                    //notify("Photo saved to device");

                    //upload to firebase storage
                    // let uploadUri = asset.uri;
                    // var ref = firebase.storage().ref().child("kpx");

                    // const response = await fetch(uploadUri);
                    // const blob = await response.blob();
                    
                    // const snapshot = await ref.put(blob);

                    //not a function call... direct code
                    


                  

                  })
                  .catch(error => {
                    
                  });
                });
              
                //display the object uri, height, width
                console.log("photo", photo);
                
                //function call to make toast...
                notify("Picture taken");
                /*
                *
                *
                * 
                * *
                * 
                */
              
                console.log("uploaded!");

              }

            }
            
            
          }>
            <Ionicons name={ Platform.OS === 'ios' ? 'ios-camera-sharp' : 'md-camera-sharp'} size={50} color="white" />
            
          </TouchableOpacity>


          <TouchableOpacity style={{alignSelf: 'center'}} onPress={async() => {
            //let bool = false;
            if(!recording){
              //bool = true;
              notify("Camera proctoring initiated");
              

              //this video object will be created only AFTER the recording has stopped.
              //await -> this function makes sure that the 'video' object's value is taken after the recordAsync() method has completed.
              //its waiting for the method to finish 
              

              //quality: Camera.Constants.VideoQuality[""] -> i've used this to set the video quality. And its working!
              //now the file size is comparatively small

              //bad quality -> 13 sec -> 2.88 MB
              //good quality -> 2.33 sec -> 6.84 MB
              
              let i = 0;

              //total 4 chunks will be stored!!!
              while(i < 4){

                console.log(i);
                setRecording(true);
                let video = await cameraRef.recordAsync({quality: Camera.Constants.VideoQuality["4:3"], maxDuration: 5, });
                console.log('video', video);


               //download the currently recorded video... 
                let uri = video.uri;

               let uploadVideoUrl = await uploadToRemoteServerAsync(uri);

                //upload to local storage
                //start
                MediaLibrary.createAssetAsync(uri).then(asset => {
              
                console.log('asset', asset);
                 MediaLibrary.createAlbumAsync('MobileProctor', asset)
                  .then(() => {
                   //notify("Video saved");
                  })
                 .catch(error => {
                   console.log(error);
                  });
                });
               //end

                setRecording(false);
                cameraRef.stopRecording();
                i++;
              }

              //add toast
            } else {
                
                notify("Please wait.. you are being proctored.");
              //add toast
            }

          }}>


            <View style={{ 
               
               borderWidth: 2,
               borderRadius: recording ? 0 : 25,
               borderColor: recording ? 'red' : 'white',
               height: recording ? 40 : 50,
               width:recording ? 40 : 50,
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center'}}
            >
              <View style={{
                 borderWidth: 2,
                 borderRadius: recording ? 0 : 25,
                 borderColor: recording ? 'red' : 'white',
                 height: recording ? 30 : 40,
                 width:recording ? 30 : 40,
                 backgroundColor: recording ? 'red' : 'white'}} >
              </View>
            </View>
          </TouchableOpacity>
            </View>
        </View>
      </Camera>
    </View>
  );

  //working for videos/audio also.
  async function uploadToRemoteServerAsync(uri) {


    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };

      console.log("completed the first phase");
      
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  
    const ref = firebase
      .storage()
      .ref()
      .child("document" + Math.random());

      console.log("completed the second phase");
      
      await ref.put(blob)
      .then(snapshot => {
          return snapshot.ref.getDownloadURL(); 
          
      })
      .then(downloadURL => {
          console.log(`Successfully uploaded file. Download link : - ${downloadURL}`);
          notify("Chunk uploaded");
          return downloadURL;
      });

    
    console.log("completed the third phase");
  
    // We're done with the blob, close and release it
    blob.close();
      
    //I'm getting a warning here
    //isn't snapshot out of scope?
    return "";
  }


  
}
