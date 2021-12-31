import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  Alert,
  Text,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  View,
  Image,
  FlatList,
} from "react-native";
import * as Location from "expo-location";
import Header from "../Components/Header";
import moment from 'moment-timezone';

const LOCATION_URL = 'https://us1.locationiq.com/v1/reverse.php?key=';
const LOCATION_API_KEY = 'pk.56f306e8c2004a0cddb3cb4818c6c4d6';

const openWeatherApiKey = "791dfc9b2c35ae8601f4a2978b8308b9";
let url = `https://api.openweathermap.org/data/2.5/onecall?&units=metric&exclude=minutely&appid=${openWeatherApiKey}`;

const Current = () => {
  const [forecast, setForecast] = useState(null);
  const [locationData, setLocationData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const loadForecast = async () => {
    setRefreshing(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status != "granted") {
      Alert.alert("Permission to access location was denied");
    }

    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });

    const response = await fetch(
      `${url}&lat=${location.coords.latitude}&lon=${location.coords.longitude}`
    );
    const data = await response.json();

    const fetchLocationData = await fetch(
      `${LOCATION_URL}${LOCATION_API_KEY}&lat=${location.coords.latitude}&lon=${location.coords.longitude}&format=json`
    );
    const locationDataObj = await fetchLocationData.json();
    setLocationData(locationDataObj);

    if (!response.ok) {
      Alert.alert(`Error reteriving weather data: ${data.message}`);
    } else {
      setForecast(data);
    }

    setRefreshing(false);
  };

  useEffect(() => {
    loadForecast();
  }, []);

  if (!forecast) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const current = forecast.current.weather[0];
  return (
    <>
      <SafeAreaView style={styles.container}>
        <Header />
        <ScrollView
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                loadForecast;
              }}
              refreshing={refreshing}
            />
          }
        >
          <Text style={styles.title}>Current Weather</Text>
          <Text style={{ alignItems: "center", textAlign: "center", fontSize: 22, fontWeight: "bold" }}>{locationData.address? locationData.address.county : ""}</Text>
          <View style={styles.current}>
            <Image
              style={styles.largeIcon}
              source={{
                uri: `http://openweathermap.org/img/wn/${current.icon}@4x.png`,
              }}
            />
            <Text style={styles.currentTemp}>
              {Math.ceil(forecast.current.temp)}°C
            </Text>
            <Text>{forecast.temp}</Text>
          </View>
          <Text style={styles.currentDescription}>
            {current.description.toUpperCase()}
          </Text>
          <View style={styles.extraInfo}>
            <View style={styles.info}>
              <Image
                source={require("../assets/temp.png")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 40 / 2,
                  marginLeft: 50,
                }}
              />
              <Text
                style={{ fontSize: 20, color: "white", textAlign: "center" }}
              >
                Feels Like
              </Text>
              <Text
                style={{ fontSize: 20, color: "white", textAlign: "center" }}
              >
                {Math.ceil(forecast.current.feels_like)}°C
              </Text>
            </View>
            <View style={styles.info}>
              <Image
                source={require("../assets/humidity.png")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 40 / 2,
                  marginLeft: 50,
                }}
              />
              <Text
                style={{ fontSize: 20, color: "white", textAlign: "center" }}
              >
                Humidity
              </Text>
              <Text
                style={{ fontSize: 20, color: "white", textAlign: "center" }}
              >
                {forecast.current.humidity}%{" "}
              </Text>
            </View>
          </View>
          <View style={styles.extraInfo}>
                    <View style={styles.info}>
                    <Image 
                        source={require('../assets/visibility.png')}
                        style={{width:40, height:40, borderRadius:40/2, marginLeft:50}}
                        />
                        <Text style={{ fontSize: 22, color: 'white', textAlign:'center' }}>{forecast.current.visibility}</Text>
                        <Text style={{ fontSize: 20, color: 'white', textAlign:'center' }}>Visibility</Text>
                    </View>

                    <View style={styles.info}>
                    <Image 
                        source={require('../assets/windspeed.png')}
                        style={{width:40, height:40, borderRadius:40/2, marginLeft:50}}
                        />
                        <Text style={{ fontSize: 20, color: 'white', textAlign:'center' }}>{forecast.current.wind_speed} m/s</Text>
                        <Text style={{ fontSize: 20, color: 'white', textAlign:'center' }}>Wind Speed</Text>
                    </View>
                </View>
            <View style={styles.extraInfo}>

                    <View style={styles.info}>
                        <Image 
                        source={require('../assets/sunrise.png')}
                        style={{width:40, height:40, borderRadius:40/2, marginLeft:50}}
                        />
                        <Text style={{ fontSize: 20, color: 'white', textAlign:'center' }}>{new Date(forecast.current.sunrise*1000).toLocaleString()}</Text>
                        <Text style={{ fontSize: 20, color: 'white', textAlign:'center' }}>Sunrise</Text>
                    </View>

                    <View style={styles.info}>
                    <Image 
                        source={require('../assets/sunset.png')}
                        style={{width:40, height:40, borderRadius:40/2, marginLeft:50}}
                        />
                        <Text style={{ fontSize: 20, color: 'white', textAlign:'center' }}>{new Date(forecast.current.sunset*1000).toLocaleString()}</Text>
                        <Text style={{ fontSize: 20, color: 'white', textAlign:'center' }}>Sunset</Text>
                    </View>
                
                </View>
          <View>
            <Text style={styles.subtitle}>Hourly Forecast</Text>
            <FlatList
              horizontal
              data={forecast.hourly.slice(0, 24)}
              keyExtractor={(Item, index) => index.toString()}
              renderItem={(hour) => {
                const weather = hour.item.weather[0];
                var dt = new Date(hour.item.dt * 1000);
                return (
                  <View style={styles.hour}>
                    <Text>{dt.toLocaleTimeString().replace(/:\d+ /, " ")}</Text>
                    <Text>{Math.ceil(hour.item.temp)}°C</Text>
                    <Image
                      style={styles.smallIcon}
                      source={{
                        uri: `http://openweathermap.org/img/wn/${weather.icon}@4x.png`,
                      }}
                    />
                    <Text>{weather.description}</Text>
                  </View>
                );
              }}
            />
          </View>

          <View>
            <Text style={styles.subtitle}>Daily Forecast</Text>
            <FlatList
              horizontal
              data={forecast.daily.slice(0, 7)}
              keyExtractor={(Item, index) => index.toString()}
              renderItem={(hour) => {
                const weather = hour.item.weather[0];
                var dt = moment(hour.item.dt * 1000).format('ddd');
                return (
                  <View style={styles.hour}>
                    <Text>{dt}</Text>
                    <Text>Min - {Math.ceil(hour.item.temp.night)}°C</Text>
                    <Text>Max - {Math.ceil(hour.item.temp.day)}°C</Text>
                    <Image
                      style={styles.smallIcon}
                      source={{
                        uri: `http://openweathermap.org/img/wn/${weather.icon}@4x.png`,
                      }}
                    />
                    <Text>{weather.description}</Text>
                  </View>
                );
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    width: "100%",
    textAlign: "center",
    fontSize: 36,
    fontWeight: "bold",
    color: "#e96e50",
  },
  subtitle: {
    fontSize: 24,
    marginVertical: 12,
    marginLeft: 7,
    color: "#e96e50",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFBF6",
  },
  loading: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  current: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
  },
  currentTemp: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  currentDescription: {
    width: "100%",
    textAlign: "center",
    fontWeight: "200",
    fontSize: 24,
    marginBottom: 5,
  },
  hour: {
    padding: 6,
    alignItems: "center",
  },
  largeIcon: {
    width: 300,
    height: 250,
  },
  smallIcon: {
    width: 100,
    height: 100,
  },
  extraInfo: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
    padding: 10,
  },
  info: {
    width: Dimensions.get("screen").width / 2.5,
    backgroundColor: "rgba(0,0,0, 0.5)",
    padding: 10,
    borderRadius: 15,
    justifyContent: "center",
  },
});

export default Current;
