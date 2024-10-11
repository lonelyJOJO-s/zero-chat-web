import React from 'react';
import {
    Button,
} from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';

import { connect } from 'react-redux'
import { actions } from '../../../redux/module/panel'
import * as Params from '../../../common/param/Params'
import { axiosGet } from '../../../util/Request';

// 实现群聊和单聊的切换

class SwitchChat extends React.Component {
    componentDidMount() {
        this.fetchUserList();
    }
    /**
     * 获取好友列表
     */
    fetchUserList = () => {
        this.props.setMenuType(1)
        axiosGet(Params.USER_LIST_URL)
            .then(response => {
                let users = response.data.users
                let data = []
                for (var index in users) {
                    let d = {
                        hasUnreadMessage: false,
                        username: users[index].username,
                        id: users[index].id,
                        messageType: 1,
                        avatar: users[index].avatar,
                        lastMessageTime: users[index].last_message_time,
                    }
                    data.push(d)
                }
                this.props.setUserList(data);
            })
    }

    /**
     * 获取群组列表
     */
    fetchGroupList = () => {
        this.props.setMenuType(2)
        axiosGet(Params.GROUP_LIST_URL)
            .then(response => {
                let users = response.data.groups
                let data = []
                for (var index in users) {
                    let d = {
                        username: users[index].name,
                        id: users[index].id,
                        avatar: users[index].avatar,
                        messageType: 2,
                        lastMessageTime: users[index].last_message_time,
                    }
                    data.push(d)
                }

                this.props.setUserList(data);
            })
    }

    render() {
        const menuType  = this.props.menuType
        return (
            <div style={{marginTop: 25}}>
                <p >
                    <Button
                        icon={<UserOutlined />}
                        size="large"
                        type='link'
                        disabled={menuType === 1}
                        onClick={this.fetchUserList}
                        style={{color: menuType === 1 ? '#1890ff' : 'gray'}}
                    >
                    </Button>
                </p>
                <p onClick={this.fetchGroupList}>
                    <Button
                        icon={<TeamOutlined />}
                        size="large"
                        type='link'
                        disabled={menuType === 2}
                        style={{color: menuType === 2 ? '#1890ff' : 'gray'}}
                    >
                    </Button>
                </p>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        user: state.userInfoReducer.user,
        menuType: state.panelReducer.menuType,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setUserList: (data) => dispatch(actions.setUserList(data)),
        setMenuType: (data) => dispatch(actions.setMenuType(data)),
    }
}

SwitchChat = connect(mapStateToProps, mapDispatchToProps)(SwitchChat)

export default SwitchChat