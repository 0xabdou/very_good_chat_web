export class GoogleAuth {
  async signIn() {
    return new Promise<string>((resolve, reject) => {
      gapi.load('auth2', () => {
        gapi.auth2.init({
          client_id: '1063557684670-rfkmbsckud2puhj9iac1g5ttdbph5jtt.apps.googleusercontent.com',
          scope: 'profile',
        }).then(async (ga) => {
          const x = await ga.signIn();
          resolve(x.getAuthResponse().id_token);
        }).catch(reject);
      });
    });
  }
}


