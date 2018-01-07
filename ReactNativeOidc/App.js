// @flow

import React, { Component } from 'react'
import {
  UIManager,
  LayoutAnimation,
  View,
  Text,
  StyleSheet
} from 'react-native'
import AppAuth from 'react-native-app-auth'

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true)

const scopes = ['openid', 'profile', 'email', 'offline_access']

type State = {
  hasLoggedInOnce: boolean,
  accessToken: ?string,
  accessTokenExpirationDate: ?string,
  refreshToken: ?string
}

const styles = StyleSheet.create({
  header: {
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5
  },
  button: {
    padding: 5,
    margin: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da'
  }
})

const Button = ({ children, onPress }) => (
  <Text onPress={onPress} style={styles.button}>
    {children}
  </Text>
)

export default class App extends Component<{}, State> {
  auth = new AppAuth({
    issuer: 'https://demo.identityserver.io',
    clientId: 'native.code',
    redirectUrl: 'io.identityserver.demo:/oauthredirect'
  })

  state = {
    hasLoggedInOnce: false,
    accessToken: '',
    accessTokenExpirationDate: '',
    refreshToken: ''
  }

  animateState(nextState: $Shape<State>, delay: number = 0) {
    setTimeout(() => {
      this.setState(() => {
        return nextState
      })
    }, delay)
  }

  authorize = async () => {
    try {
      const authState = await this.auth.authorize(scopes)
      this.animateState(
        {
          hasLoggedInOnce: true,
          accessToken: authState.accessToken,
          accessTokenExpirationDate: authState.accessTokenExpirationDate,
          refreshToken: authState.refreshToken
        },
        500
      )
    } catch (error) {
      console.error(error)
    }
  }

  refresh = async () => {
    try {
      const authState = await this.auth.refresh(this.state.refreshToken, scopes)
      this.animateState({
        accessToken: authState.accessToken || this.state.accessToken,
        accessTokenExpirationDate:
          authState.accessTokenExpirationDate ||
          this.state.accessTokenExpirationDate,
        refreshToken: authState.refreshToken || this.state.refreshToken
      })
    } catch (error) {
      console.error(error)
    }
  }

  revoke = async () => {
    try {
      await this.auth.revokeToken(this.state.accessToken, true)
      this.animateState({
        accessToken: '',
        accessTokenExpirationDate: '',
        refreshToken: ''
      })
    } catch (error) {
      console.error(error)
    }
  }

  render() {
    const { state } = this
    return (
      <View style={{ flex: 1, padding: 30 }}>
        {!!state.accessToken ? (
          <View>
            <Text style={styles.header}>accessToken</Text>
            <Text>{state.accessToken}</Text>
            <Text style={styles.header}>accessTokenExpirationDate</Text>
            <Text>{state.accessTokenExpirationDate}</Text>
            <Text style={styles.header}>refreshToken</Text>
            <Text>{state.refreshToken}</Text>
          </View>
        ) : (
          <Text style={styles.header}>
            {state.hasLoggedInOnce ? 'Signed out.' : 'Welcome'}
          </Text>
        )}

        {!state.accessToken && (
          <Button onPress={this.authorize}>Sign In</Button>
        )}
        {!!state.refreshToken && (
          <Button onPress={this.refresh}>Refresh</Button>
        )}
        {!!state.accessToken && <Button onPress={this.revoke}>Revoke</Button>}
      </View>
    )
  }
}
