class UserResponseModel {
  constructor(access_token, access_expired, userId, provider, name, email, picture) {
    this.access_token = access_token;
    this.access_expired = access_expired;
    this.userId = userId;
    this.provider = provider;
    this.name = name;
    this.email = email;
    this.picture = picture;
  }

  assembleSignInSignUpRes() {
    return {
      access_token: this.access_token,
      access_expired: this.access_expired,
      user: {
        id: this.userId,
        provider: this.provider,
        name: this.name,
        email: this.email,
        picture: this.picture,
      },
    };
  }

  assembleUserProfileRes() {
    return {
      id: this.userId,
      provider: this.provider,
      name: this.name,
      email: this.email,
      picture: this.picture,
    };
  }
}

module.exports = UserResponseModel;
