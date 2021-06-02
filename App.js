import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  Clipboard,
  Image,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Permissions from 'expo-permissions';
// import { StatusBar } from "expo-status-bar";
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';

export default class App extends Component {
  state = {
    image: null,
    uploading: false,
  };

  render() {
    let { image } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar barStyle='default' />

        <Text style={styles.exampleText}>iSight</Text>

        <Button
          onPress={this._takePhoto}
          title='Classify Object or Read Text'
        />
        <Text style={styles.exampleSpace}></Text>
        <Button onPress={() => Speech.stop()} title='Stop Speaking' />

        {this._maybeRenderImage()}
        {this._maybeRenderUploadingOverlay()}
      </View>
    );
  }

  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View style={[StyleSheet.absoluteFill, styles.maybeRenderUploading]}>
          <ActivityIndicator color='#fff' size='large' />
        </View>
      );
    }
  };

  _maybeRenderImage = () => {
    let { image } = this.state;

    if (!image) {
      return;
    }

    return (
      <View style={styles.maybeRenderContainer}>
        <View style={styles.maybeRenderImageContainer}>
          <Image source={{ uri: image }} style={styles.maybeRenderImage} />
        </View>

        <Text
          onPress={this._copyToClipboard}
          onLongPress={this._share}
          style={styles.maybeRenderImageText}
        >
          {image}
        </Text>
      </View>
    );
  };

  _share = () => {
    Share.share({
      message: this.state.image,
      title: 'Check out this photo',
      url: this.state.image,
    });
  };

  _copyToClipboard = () => {
    Clipboard.setString(this.state.image);
    alert('Copied image URL to clipboard');
  };

  _takePhoto = async () => {
    const { status: cameraPerm } = await Permissions.askAsync(
      Permissions.CAMERA
    );

    const { status: cameraRollPerm } = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );

    // only if user allows permission to camera AND camera roll
    if (cameraPerm === 'granted' && cameraRollPerm === 'granted') {
      let pickerResult = await ImagePicker.launchCameraAsync({
        // allowsEditing: true,
        // aspect: [4, 3],
        allowsEditing: false,
        // aspect: [4, 3],
        quality: 0,
      });

      this._handleImagePicked(pickerResult);
    }
  };

  _takePhotoText = async () => {
    const { status: cameraPerm } = await Permissions.askAsync(
      Permissions.CAMERA
    );

    const { status: cameraRollPerm } = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );

    // only if user allows permission to camera AND camera roll
    if (cameraPerm === 'granted' && cameraRollPerm === 'granted') {
      let pickerResult = await ImagePicker.launchCameraAsync({
        // allowsEditing: true,
        // aspect: [4, 3],
        allowsEditing: false,
        // aspect: [4, 3],
        quality: 0,
      });

      this._handleImagePickedText(pickerResult);
    }
  };

  _pickImage = async () => {
    const { status: cameraRollPerm } = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );

    // only if user allows permission to camera roll
    if (cameraRollPerm === 'granted') {
      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        // aspect: [4, 3],
        quality: 0,
      });

      this._handleImagePicked(pickerResult);
    }
  };

  _handleImagePicked = async (pickerResult) => {
    let uploadResponse, uploadResult;

    try {
      this.setState({
        uploading: true,
      });

      if (!pickerResult.cancelled) {
        uploadImageAsync(pickerResult.uri);
      }

      // if (!pickerResult.cancelled) {
      //   uploadResponse = await uploadImageAsync(pickerResult.uri);
      //   uploadResult = await uploadResponse.json();
      //   this.setState({
      //     image: uploadResult.location,
      //   });
      // speak(response);
    } catch (e) {
      // console.log({ uploadResponse });
      // console.log({ uploadResult });
      // console.log({ e });
      alert('Upload failed, sorry :(');
    } finally {
      this.setState({
        uploading: false,
      });
    }
  };

  _handleImagePickedText = async (pickerResult) => {
    let uploadResponse, uploadResult;

    try {
      this.setState({
        uploading: true,
      });

      if (!pickerResult.cancelled) {
        // uploadResponse = await uploadImageAsyncText(pickerResult.uri);
        // uploadResult = await uploadResponse.json();
        // this.setState({
        //   image: uploadResult.location,
        // });
        // speak(response);
        uploadImageAsyncText(pickerResult.uri);
      }

      // if (!pickerResult.cancelled) {
      //   uploadResponse = await uploadImageAsyncText(pickerResult.uri);
      //   uploadResult = await uploadResponse.json();
      //   this.setState({
      //     image: uploadResult.location,
      //   });
      //   // speak(response);
      // }
    } catch (e) {
      // console.log({ uploadResponse });
      // console.log({ uploadResult });
      // console.log({ e });
      alert('Upload failed, sorry :(');
    } finally {
      this.setState({
        uploading: false,
      });
    }
  };
}

var response;

function speak(text) {
  const thingToSay = '1';
  Speech.speak(text);
}

async function uploadImageAsync(uri) {
  const apiUrl = 'http://52.172.148.196:8000/upload';
  let uriParts = uri.split('.');
  let fileType = uriParts[uriParts.length - 1];

  let formData = new FormData();
  formData.append('photo', {
    uri,
    name: `photo.${fileType}`,
    type: `image/${fileType}`,
  });

  let options = {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  };

  async function getData() {
    response = await fetch(apiUrl, options);
    const json = await response.json();
    response = json.txt;
    Speech.speak(response);
  }
  await getData();
  // return fetch(apiUrl, options);
}

async function uploadImageAsyncText(uri) {
  const apiUrl = 'http://52.172.148.196:8000/uploadText';
  let uriParts = uri.split('.');
  let fileType = uriParts[uriParts.length - 1];

  let formData = new FormData();
  formData.append('photo', {
    uri,
    name: `photo.${fileType}`,
    type: `image/${fileType}`,
  });

  let options = {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  };

  async function getData() {
    response = await fetch(apiUrl, options);
    const json = await response.json();
    response = json.txt;
    speak(response);
  }
  await getData();
  // return fetch(apiUrl, options);
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  exampleText: {
    fontSize: 30,
    marginBottom: 20,
    marginHorizontal: 15,
    textAlign: 'center',
  },

  exampleSpace: {
    fontSize: 2,
    marginBottom: 10,
    marginHorizontal: 15,
    textAlign: 'center',
  },

  maybeRenderUploading: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  maybeRenderContainer: {
    borderRadius: 3,
    elevation: 2,
    marginTop: 30,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 4,
      width: 4,
    },
    shadowRadius: 5,
    width: 250,
  },
  maybeRenderImageContainer: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
  },
  maybeRenderImage: {
    height: 250,
    width: 250,
  },
  maybeRenderImageText: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
