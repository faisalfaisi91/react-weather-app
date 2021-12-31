import React from "react";
import { Appbar, Text } from "react-native-paper";
import {
  StyleSheet,
  Alert,
} from "react-native";

// import CaptureScreen
import { captureScreen } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";

const Header = () => {
  const _handleMore = () => console.log("show more");

  const takeScreenShot = () => {
    (async () => {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (!permission.granted) return;
        // To capture Screenshot
        captureScreen({
          // Either png or jpg (or webm Android Only), Defaults: png
          format: 'jpg',
          // Quality 0.0 - 1.0 (only available for jpg)
          quality: 0.8, 
        }).then(
          //callback function to get the result URL of the screnshot
          (uri) => {
            (async () => {
              await MediaLibrary.createAssetAsync(uri);
              Alert.alert(
                "Screen Capture",
                "Screenshot has been saved to gallery.",
              );
            })();
          },
          (error) => console.error('Oops, Something Went Wrong', error),
        );
    })();
    //console.log(savedImagePath);
    //savePicture(savedImagePath);
  };
  return (
    <>
      <Appbar.Header style={{ backgroundColor: "#57abff", height: "5%" }}>
        <Appbar.Action
          style={{ marginTop: "10%" }}
          icon="camera"
          onPress={takeScreenShot}
        />
        <Appbar.Content
          title={
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>Faisal</Text>
          }
          style={{ width: "100%" }}
        />
        <Appbar.Action
          style={{ marginTop: "10%" }}
          icon="dots-vertical"
          onPress={_handleMore}
        />
      </Appbar.Header>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
  },
  titleText: {
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
  },
  textStyle: {
    textAlign: "center",
    padding: 10,
  },
  buttonStyle: {
    fontSize: 16,
    color: "white",
    backgroundColor: "green",
    padding: 5,
    minWidth: 250,
  },
  buttonTextStyle: {
    padding: 5,
    color: "white",
    textAlign: "center",
  },
});

export default Header;
