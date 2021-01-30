import {
  Module,
  VuexModule,
  Mutation,
  Action,
  getModule,
} from 'vuex-module-decorators';
import store from '../index';
import User from '@/models/dto/user';
import axios, { AxiosError, AxiosResponse } from 'axios';
import LoginForm from '@/models/form/loginForm';
import router from '@/router';

@Module({
  dynamic: true,
  store,
  name: 'LoginUser',
  namespaced: true,
})
class LoginUser extends VuexModule {
  private user: User = new User();
  private isAuthenticated: boolean = false;

  @Mutation
  public SET_LOGIN_USER_INFO(user: User) {
    this.isAuthenticated = true;
    this.user = user;
  }

  @Mutation
  public DROP_LOGIN_USER_INFO() {
    this.isAuthenticated = false;
    this.user = new User();
  }

  @Action({ rawError: true })
  async login(loginForm: LoginForm) {
    const formData = new FormData();
    formData.append('email', loginForm.id);
    formData.append('password', loginForm.password);
    await axios
      .post('/login', formData)
      .then((res: AxiosResponse) => {
        this.SET_LOGIN_USER_INFO(res.data);
        router.push({ path: '/kanban' });
      })
      .catch((error: AxiosError) => {});
  }

  @Action({ rawError: true })
  async verifyAuthentication() {
    await axios
      .post('/auth/verify', { withCredentials: true })
      .then((res: AxiosResponse) => {
        this.SET_LOGIN_USER_INFO(res.data);
      })
      .catch((error: AxiosError) => {
        this.DROP_LOGIN_USER_INFO();
      });
  }

  get getUserInfo(): User {
    return this.user;
  }

  get getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }
}
export const loginUser = getModule(LoginUser);
