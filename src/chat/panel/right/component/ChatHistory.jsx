import React from 'react';
import { connect } from 'react-redux'
import { actions } from '../../../redux/module/panel'

import {
    Tooltip,
    Button
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import SearchModal from './searchModal';
class ChatHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showSearchModal: false,
        };
    }

    toggleSearchModal = () => {
        this.setState({ showSearchModal: !this.state.showSearchModal });
    };

    render() {
        const { chooseUser } = this.props;
        return (
            <>
                <Tooltip title="搜索历史记录">
                    <Button
                        onClick={this.toggleSearchModal}  // 点击按钮弹出搜索模态框
                        shape="circle"
                        style={{ marginRight: 10 }}
                        icon={<SearchOutlined />}  // 使用搜索图标
                        disabled={chooseUser.toUser === ''}  // 判断是否禁用
                    />
                </Tooltip>

                {this.state.showSearchModal && (
                    <SearchModal
                        visible={this.state.showSearchModal}  // 传递模态框的显示状态
                        onClose={this.toggleSearchModal}      // 关闭模态框的回调函数
                        history={this.props.history}          // 传递其他需要的 props
                    />
                )}
            </>
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

ChatHistory = connect(mapStateToProps, mapDispatchToProps)(ChatHistory)

export default ChatHistory