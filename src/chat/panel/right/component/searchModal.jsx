import React from 'react';
import { axiosGet } from '../../../util/Request';
import * as Params from '../../../common/param/Params'
import { connect } from 'react-redux'
import { actions } from '../../../redux/module/panel'
import { Drawer, Tooltip, Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
class SearchModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQuery: "", // 用于存储用户的搜索输入
            offset: 0,
            searchResults: [],
        };
    }

    handleSearchInputChange = (event) => {
        this.setState({ searchQuery: event.target.value });
    };

    handleSearch = () => {
        // 执行搜索逻辑，可能是从服务器获取历史记录，或者从已加载的消息中筛选
        console.log("Searching for:", this.state.searchQuery);
        // 假设你有一个方法可以从聊天记录中搜索结果
        this.searchChatHistory(this.state.searchQuery);
    };

    searchChatHistory = (query) => {
        const { messageType, toUser } = this.props.chooseUser;
        let data = {
            id: toUser,
            chat_type: messageType,
            limit: 20,
            offset: this.state.offset,
            keyword: query,
        }
        axiosGet(Params.MESSAGE_SEARCH_URL, data)
        .then(response => {
            const messages = response.data.msgs;
            console.log(messages)
            this.setState(prevState => ({
                searchResults: [...prevState.searchResults, ...messages]  // 合并数组
            }));
        })
        .catch(error => {
            console.error("加载历史消息失败：", error);
        })
        .finally(() => {
            this.setState({ offset: this.state.offset + data.limit });
        });
        // 你可以将搜索结果保存到 state 或直接显示
    };

    searchPanelOnClose = () => {

    }

    render() {
        return (
            <Drawer 
                width="820px" 
                forceRender={true} 
                title="搜索聊天记录" 
                placement="right" 
                onClose={this.props.onClose} 
                visible={this.props.visible}
            >
                {/* 搜索输入框和按钮 */}
                <Input 
                    placeholder="请输入关键字" 
                    value={this.state.searchQuery} 
                    onChange={this.handleSearchInputChange} // 监听输入
                    style={{ width: 'calc(100% - 50px)', marginRight: '10px' }}
                />
                <Tooltip title="搜索聊天记录">
                    <Button
                        shape="circle"
                        onClick={this.handleSearch}  // 执行搜索的函数
                        icon={<SearchOutlined />}        // 搜索图标
                    />
                </Tooltip>
        
                <br />
        
                {/* 搜索结果显示 */}
                <div style={{ marginTop: '20px' }}>
                    {this.state.searchResults.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {this.state.searchResults.map((result, index) => (
                                <li 
                                    key={index} 
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        marginBottom: '15px',
                                        padding: '10px',
                                        borderBottom: '1px solid #f0f0f0'
                                    }}
                                >
                                    {/* 用户头像 */}
                                    <img
                                        src={result.avatar}
                                        alt="avatar"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            marginRight: '10px'
                                        }}
                                    />
                                    
                                    <div>
                                        {/* 用户名和时间 */}
                                        <div style={{ marginBottom: '5px' }}>
                                            <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{result.fromUsername}</span>
                                            <span style={{ color: '#999', fontSize: '12px' }}>
                                                {new Date(parseInt(result.send_time / 1e6)).toLocaleString()} {/* 处理时间 */}
                                            </span>
                                        </div>

                                        {/* 消息内容 */}
                                        <div style={{  padding: '10px', borderRadius: '5px' }}>
                                            {result.content_type === 1 ? ( 
                                                // 文本消息
                                                <span>{result.content}</span>
                                            ) : result.content_type === 2 ? (
                                                // 文件消息
                                                <a href={result.file} target="_blank" rel="noopener noreferrer">
                                                    点击下载文件
                                                </a>
                                            ) : (
                                                <span>未知消息类型</span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>没有找到匹配的聊天记录</p>
                    )}
            </div>

            </Drawer>
        );
    }
}


function mapStateToProps(state) {
    return {
        chooseUser: state.panelReducer.chooseUser,
        // messageList: state.panelReducer.messageList,
        //. menuType: state.panelReducer.menuType,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setUser: (data) => dispatch(actions.setUser(data)),
        setChooseUser: (data) => dispatch(actions.setChooseUser(data)),
        // setMessageList: (data) => dispatch(actions.setMessageList(data)),
        
    }
}

SearchModal = connect(mapStateToProps, mapDispatchToProps)(SearchModal)

export default SearchModal
