import React, { useEffect, useState } from "react";
import * as Battery from "expo-battery";
import * as Location from "expo-location";
import * as IntentLauncher from "expo-intent-launcher";
import * as Notification from "expo-notifications";

import CurrentScreen from "./Screens/Current";
import CityWiseScreen from "./Screens/CityWise";

import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { View, StyleSheet, Text, Platform, Linking, Alert, BackHandler } from "react-native";

const Tab = createMaterialBottomTabNavigator();
const BACKGROUND_ACTIVITY = "BACKGROUND_ACTIVITY";

export default function App() {
  const [noLocation, setNoLocationState] = useState(false);
  (async () => {
    const batteryLevel = await Battery.getBatteryLevelAsync();
    stopApplicationServices(batteryLevel);
    Battery.addBatteryLevelListener(({ batteryLevel }) => {
      stopApplicationServices(batteryLevel);
    });
  })();

  //Show the location notification in the background notification
  Location.startLocationUpdatesAsync(BACKGROUND_ACTIVITY, {
    accuracy: Location.Accuracy.Highest,
    distanceInterval: 1,
    deferredUpdatesInterval: 1000,
    foregroundService: {
      notificationTitle: "Weather App is Using your location",
      notificationBody: "To turn off, open settings for location permissions.",
    },
  });

  const stopApplicationServices = (batteryLevel) => {
    if (batteryLevel < 0.20 && !noLocation) {
      Alert.alert(
        "Battery Low",
        "We need to close this app because your battery is low"
      );
      (async () => {
        const batteryNotification =
          await Notification.scheduleNotificationAsync({
            content: {
              title: "Battery Low",
              body: "We need to close this app because your battery is low",
            },
            trigger: null,
          });
        Notification.removePushTokenSubscription(batteryNotification);
      })();
      setNoLocationState(true);
      BackHandler.exitApp();
    }
  };

  useEffect(() => {
    (async () => {
      let notificationStatus = (await Notification.requestPermissionsAsync())
        .status;
      if (notificationStatus !== "granted") {
        console.log("notification permissions denied");
        return;
      }

      const serviceStatus = await Location.getProviderStatusAsync();
      if (!serviceStatus.locationServicesEnabled) {
        if (Platform.OS === "ios") {
          Linking.openURL("app-settings:");
        } else {
          IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
          );
        }
      }

      let foregroundStatus = (
        await Location.requestForegroundPermissionsAsync()
      ).status;
      console.log(foregroundStatus);
      if (foregroundStatus !== "granted") {
        console.log("foreground permissions denied, turning off location");
        setNoLocationState(true);
        return;
      }

      let backgroundStatus = (
        await Location.requestBackgroundPermissionsAsync()
      ).status;
      console.log(backgroundStatus);
      if (backgroundStatus !== "granted") {
        console.log("background permissions denied, turning off location");
        setNoLocationState(true);
        return;
      }
    })();
  }, []);
  return (
    <View style={styles.container}>
      {noLocation && (
        <View style={styles.container}>
          <View style={styles.subContainer}>
            <Text style={styles.title}>No Location Available</Text>
          </View>
        </View>
      )}
      {!noLocation && (
        <NavigationContainer>
          <Tab.Navigator
            labeled={false}
            barStyle={{ backgroundColor: "#3399FF" }}
            activeColor="black"
          >
            <Tab.Screen
              name="Current"
              children={() => <CurrentScreen />}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="home" color={color} size={26} />
                ),
              }}
            />
            <Tab.Screen
              name="CityWise"
              children={() => <CityWiseScreen />}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="city" color={color} size={26} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 35,
  },
  subContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  right: {
    position: "absolute",
    right: 0,
    top: 60,
  },
  captureImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});
