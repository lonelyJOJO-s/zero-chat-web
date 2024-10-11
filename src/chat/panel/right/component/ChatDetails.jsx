import React from 'react';
import {
    Avatar,
    Drawer,
    List,
    Badge,
    Card,
    Comment,
    Tooltip,
    message
} from 'antd';

import {
    MoreOutlined,
    ManOutlined, 
    WomanOutlined,
    FileOutlined
} from '@ant-design/icons';

import InfiniteScroll from 'react-infinite-scroll-component';
import { connect } from 'react-redux'
import { actions } from '../../../redux/module/panel'
import * as Params from '../../../common/param/Params'
import { axiosGet } from '../../../util/Request';
import moment from 'moment';

const CommentList = ({ comments, currentUsername }) => (
    
    <InfiniteScroll
        dataLength={comments.length}
        scrollableTarget="scrollableDiv"
    >
        <List
            dataSource={comments}
            itemLayout="horizontal"
            renderItem={props => (
                
                <div
                style={{
                    display: 'flex',
                    justifyContent: props.author === currentUsername ? 'flex-end' : 'flex-start', // 根据作者来确定对齐方式
                    padding: '10px',
                    alignItems: "center", // 垂直居中对齐头像和内容
                }}
                >
                <div
                    style={{
                    maxWidth: '70%', // 设置评论容器的最大宽度
                    padding: '10px',
                    borderRadius: '5px',
                    // backgroundColor: props.author === currentUsername ? '#e6f7ff' : '#f5f5f5', // 根据作者设置背景颜色
                    alignSelf: props.author === currentUsername ? 'flex-end' : 'flex-start', // 让自己的消息靠右
                    }}
                >
                    <Comment
                    avatar={props.avatar}
                    datetime={
                        <span
                          style={{
                            width: "100px", // 设置时间宽度
                            display: "inline-block",
                            textAlign: "center",
                          }}
                        >
                          {props.datetime}
                        </span>
                      }
                    author={props.author}
                    content={
                        <div
                          style={{
                            backgroundColor: props.contentType === 1 ? props.author === currentUsername ? '#e6f7ff' : '#f5f5f5' : 'transparent', // 自己的消息为浅蓝色背景，其他消息为浅灰色背景
                            padding: '10px',
                            borderRadius: '5px',
                            display: 'inline-block', // 确保背景色只包裹文字
                            wordWrap: "break-word", // 自动换行
                            wordBreak: "break-all", // 长单词也换行
                            whiteSpace: "pre-wrap", // 保留换行符，并允许换行
                          }}
                        >
                          {props.content}
                        </div>
                    }
                    style={{
                        textAlign: 'left', // 文本左对齐
                        maxWidth: '100%', // 内容填充剩余空间
                    }}
                    />
                </div>
                </div>
            )}
            />
    </InfiniteScroll>
);

class ChatDetails extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            groupUsers: [],
            drawerVisible: false,
            messageList: [],
            loading: false, // 数据加载状态
        }
    }

    static getDerivedStateFromProps(nextProps, preState) {
        if (nextProps.messageList !== preState.messageList) {
            return {
                ...preState,
                messageList: nextProps.messageList,
            }
        }
        return null;
    }

    handleScroll = () => {
        const scrollableDiv = document.getElementById('scrollableDiv');
        const {hasMore} = this.props.chooseUser
        if (scrollableDiv.scrollTop === 0 && !this.state.loading && hasMore) {
            this.loadMoreMessages();
        }
    }

    loadMoreMessages = () => {
        this.setState({ loading: true });
        const { messageType, toUser, readIndex } = this.props.chooseUser;
        console.log(readIndex)
        let id = toUser
        let data = {
            id: id,
            cnt: 15,
            chat_type: messageType,
            offset: readIndex,
        }
        const scrollableDiv = document.getElementById('scrollableDiv');
        const currentScrollTop = scrollableDiv.scrollTop; // 记录当前滚动位置
        axiosGet(Params.MESSAGE_URL, data)
            .then(response => {
                const newMessages = response.data.msgs;
                if (newMessages === null) {
                    this.props.setChooseUser({
                        ...this.props.chooseUser,
                        hasMore: false
                    });
                    message.info("no more data.")
                } else {
                    let comments = []
                    for (var i = newMessages.length - 1; i >= 0; i--) {
                        let contentType = newMessages[i].content_type
                        let content = this.getContentByType(contentType, newMessages[i].file, newMessages[i].content)
                        let unixSeconds = Math.floor(newMessages[i].send_time / 1000000)
                        let comment = {
                            author: newMessages[i].fromUsername,
                            avatar: newMessages[i].avatar,
                            content: <p>{content}</p>,
                            datetime: moment(unixSeconds).fromNow(),
                            contentType: contentType,
                        }
                        comments.push(comment)
                    }
                    let prevLength = this.props.messageList.length
                    this.props.setMessageList([...comments, ...this.props.messageList])
                    this.props.setChooseUser({
                        ...this.props.chooseUser,
                        readIndex: response.data.next_read_index
                    });
                    const newScrollHeight = scrollableDiv.scrollHeight; // 新消息后新的滚动高度
                    scrollableDiv.scrollTop = newScrollHeight - (currentScrollTop +  prevLength * 80); // 更新滚动位置
                }
            })
            .catch(error => {
                console.error("加载更多消息失败：", error);
            })
            .finally(() => {
                this.setState({ loading: false });
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

    componentDidUpdate(prevProps) {
        if (prevProps.messageList !== this.state.messageList && !this.state.loading) {
            this.scrollToBottom();
        }
    }

    componentWillUnmount() {
        const scrollableDiv = document.getElementById('scrollableDiv');
        scrollableDiv.removeEventListener('scroll', this.handleScroll);
    }

    componentDidMount() {
        const scrollableDiv = document.getElementById('scrollableDiv');
        scrollableDiv.addEventListener('scroll', this.handleScroll);
    }

    /**
     * 发送消息或者接受消息后，滚动到最后
     */
    scrollToBottom = () => {
        let div = document.getElementById("scrollableDiv")
        div.scrollTop = div.scrollHeight
    }

    /**
     * 获取群聊信息，群成员列表
     */
    chatDetails = () => {
        if (this.props.chooseUser.messageType === 2) { // 群聊
            axiosGet(Params.GROUP_USER_URL + "?id=" + this.props.chooseUser.toUser)
            .then(response => {
                if (null == response.data) {
                    return;
                }
                this.setState({
                    drawerVisible: true,
                    groupUsers: response.data.users
                })
            });

        }
        
    }

    drawerOnClose = () => {
        this.setState({
            drawerVisible: false,
        })
    }


    render() {

        return (
            <>
                <Badge.Ribbon text={<MoreOutlined onClick={this.chatDetails} />}>

                    <Card title={this.props.chooseUser.toUsername} size="larg">
                        <div
                            id="scrollableDiv"
                            style={{
                                height: document.body.scrollHeight / 3 * 1.4,
                                overflow: 'auto',
                                padding: '0 16px',
                                border: '0px solid rgba(140, 140, 140, 0.35)',
                                // backgroundColor: props.author === currentUsername ? '#e6f7ff' : '#f5f5f5', // 根据作者设置背景色
                                // float: props.author === currentUsername ? 'right' : 'left', // 根据作者设置对齐
                            }}
                        >
                            {this.props.messageList.length > 0 && <CommentList comments={this.props.messageList} currentUsername={localStorage.username}/>}

                        </div>
                    </Card>

                </Badge.Ribbon>
                <Drawer title="成员列表" placement="right" onClose={this.drawerOnClose} visible={this.state.drawerVisible}>
                    <List
                        itemLayout="horizontal"
                        dataSource={this.state.groupUsers}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    style={{ paddingLeft: 30 }}
                                    avatar={<Avatar src={item.avatar} />}
                                    title={item.username}
                                    description={
                                        <span>
                                            {item.sex === 0 ? <ManOutlined style={{ marginRight: 8 }} /> : <WomanOutlined  style={{ marginRight: 8 }} />}
                                            <Tooltip title={`个性签名: ${item.desc}`}>
                                            more
                                            </Tooltip>
                                        </span>
                                        
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Drawer>
            </>
        );
    }
}


function mapStateToProps(state) {
    return {
        chooseUser: state.panelReducer.chooseUser,
        messageList: state.panelReducer.messageList,
        menuType: state.panelReducer.menuType,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setUser: (data) => dispatch(actions.setUser(data)),
        setChooseUser: (data) => dispatch(actions.setChooseUser(data)),
        setMessageList: (data) => dispatch(actions.setMessageList(data)),
        
    }
}

ChatDetails = connect(mapStateToProps, mapDispatchToProps)(ChatDetails)

export default ChatDetails