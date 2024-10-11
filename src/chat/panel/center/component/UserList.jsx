import React from 'react';
import {
    List,
    Badge,
    Avatar,
} from 'antd';
import {
    FileOutlined,
} from '@ant-design/icons';

import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';
import { connect } from 'react-redux'
import { actions } from '../../../redux/module/panel'
import * as Params from '../../../common/param/Params'
import { axiosGet } from '../../../util/Request';


class UserList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            chooseUser: {}
        }
    }

    componentDidMount() {
    }

    /**
     * 选择用户，获取对应的消息
     * @param {选择的用户} value 
     */
    chooseUser = (value) => {
        let chooseUser = {
            toUser: value.id,
            toUsername: value.username,
            messageType: value.messageType,
            avatar: value.avatar,
            readIndex: 0,
            hasMore: true,
        }
        // 抓取消息
        this.fetchMessages(chooseUser);
        // 删除红心
        this.removeUnreadMessageDot(value.id);
    }

    /**
     * 获取消息
     */
    fetchMessages = (chooseUser) => {
        const { messageType, toUser, readIndex } = chooseUser
        console.log(readIndex)
        let id = toUser
        let data = {
            id: id,
            cnt: 15,
            chat_type: messageType,
            offset: readIndex,
        }
        axiosGet(Params.MESSAGE_URL, data)
            .then(response => {
                let comments = []
                let data = response.data.msgs
                if (null == data) {
                    data = []
                }
                for (var i = data.length - 1; i >= 0; i--) {
                    let contentType = data[i].content_type
                    let content = this.getContentByType(contentType, data[i].file, data[i].content)
                    let unixSeconds = Math.floor(data[i].send_time / 1000000)
                    let comment = {
                        author: data[i].fromUsername,
                        avatar: data[i].avatar,
                        content: <p>{content}</p>,
                        datetime: moment(unixSeconds).fromNow(),
                        contentType: contentType,
                    }
                    comments.push(comment)
                }
                chooseUser.readIndex = response.data.next_read_index
                this.props.setMessageList(comments);
                // 设置选择的用户信息时，需要先设置消息列表，防止已经完成了滑动到底部动作后，消息才获取完成，导致消息不能完全滑动到底部
                this.props.setChooseUser(chooseUser);
            });
    }

    /**
     * 根据文件类型渲染对应的标签，比如视频，图片等。
     * @param {文件类型} type 
     * @param {文件地址} url 
     * @returns 
     */
    getContentByType = (type, url, content) => {
        if (type === 2) {
            content = (<a href={url} download={content}>
                <FileOutlined style={{ fontSize: 38 }} />
                {content}
            </a>
            )
        } else if (type === 3) {
            content = <img src={url} alt="" width="150px" />
        } else if (type === 4) {
            content = <audio src={url} controls autoPlay={false} preload="auto" />
        } else if (type === 5) {
            content = <video src={url} controls autoPlay={false} preload="auto" width='200px' />
        }

        return content;
    }

    /**
     * 查看消息后，去掉未读提醒
     * @param {发送给对应人员的id} toId 
     */
    removeUnreadMessageDot = (toId) => {
        let userList = this.props.userList;
        for (var index in userList) {
            if (userList[index].id === toId) {
                userList[index].hasUnreadMessage = false;
                this.props.setUserList(userList);
                break;
            }
        }
    }

    formatTimestamp = (timestamp) => {
        console.log(timestamp)
        const date = new Date(timestamp * 1000); // 创建 Date 对象
        return date.toISOString().slice(0, 19).replace("T", " "); // 格式化为字符串，例如：2023-10-11 10:00:00
    }

    render() {

        return (
            <>
                <div id="userList" style={{
                    height: document.body.scrollHeight - 125,
                    overflow: 'auto',
                }}>
                    <InfiniteScroll
                        dataLength={this.props.userList.length}
                        scrollableTarget="userList"
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={this.props.userList}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        style={{ paddingLeft: 30 }}
                                        onClick={() => this.chooseUser(item)}
                                        avatar={<Badge dot={item.hasUnreadMessage}><Avatar src={item.avatar} /></Badge>}
                                        title={item.username}
                                        description={this.formatTimestamp(item.lastMessageTime)}
                                    />
                                </List.Item>
                            )}
                        />
                    </InfiniteScroll>
                </div>
            </>
        );
    }
}


function mapStateToProps(state) {
    return {
        chooseUser: state.panelReducer.chooseUser,
        userList: state.panelReducer.userList,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setChooseUser: (data) => dispatch(actions.setChooseUser(data)),
        setUserList: (data) => dispatch(actions.setUserList(data)),
        setMessageList: (data) => dispatch(actions.setMessageList(data)),
    }
}

UserList = connect(mapStateToProps, mapDispatchToProps)(UserList)

export default UserList