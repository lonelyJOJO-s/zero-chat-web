export const API_VERSION = "/api/v1/";

const PROTOCOL = "http://"
export const IP_PORT = "10.87.81.207:8088";
//local
export const HOST = PROTOCOL + IP_PORT;

export const LOGIN_URL = HOST + '/usercenter' + API_VERSION + 'user/login/username'
export const REGISTER_URL = HOST +  '/usercenter' + API_VERSION + 'user/register'
export const USER_URL = HOST + '/usercenter' + API_VERSION + 'user/detail'
export const USER_SEARCH_URL = HOST + '/usercenter' + API_VERSION + 'user/search' // search users not belong to users
export const USER_LIST_URL = HOST + '/usercenter' + API_VERSION + "user/friends"
export const USER_FRIEND_SEARCH_URL = HOST + '/usercenter' + API_VERSION + "user/friend/search"

export const USER_FRIEND_URL = HOST + '/usercenter' + API_VERSION + 'user/friend'

export const MESSAGE_URL = HOST + '/chat' + API_VERSION +  'history-message'
export const MESSAGE_SEARCH_URL = HOST + '/chat' + API_VERSION + '/history-message/search'

export const GROUP_LIST_URL = HOST + '/usercenter' + API_VERSION + 'groups'
export const GROUP_USER_URL = HOST + '/usercenter' + API_VERSION + '/group/members'
export const GROUP_JOIN_URL = HOST + '/usercenter' + API_VERSION + 'group/join'
export const GROUP_CREATE_URL  = HOST + '/usercenter' + API_VERSION + 'group/create'
export const GROUP_SEARCH_JOINED_URL  = HOST + '/usercenter' + API_VERSION + 'group/search-joined'
export const GROUP_SEARCH_All_URL  = HOST + '/usercenter' + API_VERSION + 'group/search-all'

export const FILE_URL = HOST +  '/usercenter' + API_VERSION + 'user/avatar'




export const FINANCIAL_PARAM_URL = HOST + API_VERSION + 'financial-param/';
export const AUTH_HEADER_KEY = "Authorization";
export const TOKEN_PREFIX = "Bearer ";

