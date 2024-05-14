import React from 'react';
import {
    Row,
    Button,
    Col,
    Menu,
    Modal,
    Dropdown,
    Input,
    Form,
    message,
    List,
    Avatar,
    Tooltip,
    Upload
} from 'antd';
import { PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';

import { connect } from 'react-redux'
import { actions } from '../../../redux/module/panel'
import * as Params from '../../../common/param/Params'
import { axiosGet, axiosPostBody } from '../../../util/Request';


class UserSearch extends React.Component {
    groupForm = React.createRef();
    constructor(props) {
        super(props)
        this.state = {
            showCreateGroup: false,
            hasUser: false, // 控制user框
            hasGroup: false, //控制group框
            queryUser: {
                id: 0,
                username: '',
                email: '',
                phone: ''
            },
            queryUsers: [],
            selectedUserId: 0,
            fileList: [],
        }
    }

    fetchUserList = () => {
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
                    }
                    data.push(d)
                }
                this.props.setUserList(data);
            })
    }

    fetchGroupList = () => {
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
                    }
                    data.push(d)
                }

                this.props.setUserList(data);
            })
    }

    /**
     * 搜索已有的用户
     * @param {*} value 
     * @param {*} _event 
     * @returns 
     */
    searchFriend = (value, _event) => {
        let data = {
            keyword: value
        }
        if (this.props.menuType === 1) { // 搜索好友
            if (null === value || "" === value) {
                this.fetchUserList()
                return
            }
            axiosGet(Params.USER_FRIEND_SEARCH_URL, data)
                .then(response => {
                    let users = response.data.users
                    if (users === null) {
                        message.error("未查找到用户");
                        return;
                    }
                    let queryUsers = users.map(user => ({
                        username: user.username,
                        avatar: user.avatar,
                        id: user.id,
                        messageType: 1,
                    }));
                    this.props.setUserList(queryUsers);
                });
        } else { // 搜索加入的群组
            if (null === value || "" === value) {
                this.fetchGroupList()
                return
            }
            axiosGet(Params.GROUP_SEARCH_JOINED_URL, data)
                .then(response => {
                    let groups = response.data.groups
                    if (groups === null) {
                        message.error("未查找到群组");
                        return;
                    }
                    let queryUsers = groups.map(group => ({
                        username: group.name,
                        avatar: group.avatar,
                        id: group.id,
                        messageType: 2,
                    }));
                    this.props.setUserList(queryUsers);
                });
        }
    }

    searchUser = (value, _event) => {
        if (null === value || "" === value) {
            return
        }
        let data = {
            keyword: value
        }
        axiosGet(Params.USER_SEARCH_URL, data)
            .then(response => {
                let users = response.data.users
                if (users === null) {
                    message.error("未查找到群或者用户");
                    return;
                }
                let queryUsers = users.map(user => ({
                    username: user.username,
                    avatar: user.avatar,
                    id: user.id,
                    messageType: 1,
                    email: user.email,
                    phone: user.phone
                }));
                this.setState({
                    hasUser: true,
                    queryUsers: queryUsers
                });
            });
    }

    searchGroup = (value, _event) => {
        if (null === value || "" === value) {
            return
        }
        let data = {
            keyword: value
        }
        axiosGet(Params.GROUP_SEARCH_All_URL, data)
            .then(response => {
                let groups = response.data.groups
                if (groups === null) {
                    message.error("未查找到群组");
                    return;
                }
                let queryUsers = groups.map(group => ({
                    username: group.name,
                    avatar: group.avatar,
                    desc: group.desc,
                    id: group.id,
                    messageType: 2,
                }));
                this.setState({
                    hasGroup: true,
                    queryUsers: queryUsers
                });
            });
    }

    showUserModal = () => {
        this.setState({
            hasUser: true
        });
    };

    showGroupModal = () => {
        this.setState({
            hasGroup: true
        });
    };


    addUser = () => {
        axiosPostBody(Params.USER_FRIEND_URL + "/" + this.state.queryUser.id)
            .then(_response => {
                message.success("添加成功")
                this.setState({
                    hasUser: false
                });
            });
    };
    // todo
    joinGroup = () => {
        // /group/join/:userUid/:groupUuid
        axiosPostBody(Params.GROUP_JOIN_URL +"/"  + this.state.queryUser.id)
            .then(_response => {
                message.success("添加成功")
                this.fetchGroupList()
                this.setState({
                    hasGroup: false
                });
            });
    }

    handleCancel = () => {
        this.setState({
            hasUser: false,
            hasGroup: false,
            selectedUserId: 0,
            queryUser: {},
            queryUsers: []
            
        });
    };

    showCreateGroup = () => {
        this.setState({
            showCreateGroup: true
        });
    }

    handleCancelGroup = () => {
        this.setState({
            showCreateGroup: false
        });
    }

    /**
     * 创建群
     */
    createGroup = () => {
        let values = this.groupForm.current.getFieldValue();
        let formData = new FormData();
        formData.append('name', values.groupName);
        formData.append('desc', values.groupDescription);
        formData.append('file', this.state.fileList[0]);
        axiosPostBody(Params.GROUP_CREATE_URL, formData)
            .then(_response => {
                message.success("添加成功")
                this.setState({
                    showCreateGroup: false
                });
            });
    }

    ChooseUser = (user) => {
        this.setState({
            queryUser: user,
            selectedUserId: user.id
        })
            
    } 

    handleBeforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt4M = file.size / 1024 / 1024 < 4;
        if (!isLt4M) {
            message.error('Image must smaller than 4MB!');
        }
        
        if (isJpgOrPng && isLt4M) {
            this.setState({ fileList: [file] });
            return true
        } else {
            return false
        }
      };
    
    handlePreviewCancel = () => {
        this.setState({ previewVisible: false });
    };

    

    render() {
        const menu = (
            <Menu>
                <Menu.Item key={1}>
                    <Button type='link' onClick={this.showUserModal}>添加用户</Button>
                </Menu.Item>
                <Menu.Item key={2}>
                    <Button type='link' onClick={this.showGroupModal}>添加群</Button>
                </Menu.Item>
                <Menu.Item key={3}>
                    <Button type='link' onClick={this.showCreateGroup}>创建群</Button>
                </Menu.Item>
            </Menu>
        );
        const { fileList } = this.state;
        return (
            <>
                <Row>
                    <Col span={20} >
                        <Input.Group compact>
                            <Input.Search allowClear style={{ width: '100%' }} onSearch={this.searchFriend} />
                        </Input.Group>
                    </Col>
                    <Col>
                        <Dropdown overlay={menu} placement="bottomCenter" arrow>
                            <PlusCircleOutlined style={{ fontSize: 22, color: 'gray', marginLeft: 3, marginTop: 5 }} />
                        </Dropdown>
                    </Col>
                </Row>
              

                <Modal title="用户信息" visible={this.state.hasUser} onCancel={this.handleCancel} okText="添加用户" footer={null}>
                    <Input.Group compact>
                        <Input.Search allowClear style={{ width: '100%' }} onSearch={this.searchUser} />
                    </Input.Group>
                    <br /><hr /><br />
                    <List
                        dataSource={this.state.queryUsers}
                        renderItem={(user) => (
                        <List.Item onClick={() => this.ChooseUser(user)}
                        style={{ backgroundColor: user.id === this.state.selectedUserId ? 'lightblue' : 'inherit' }}>
                            <List.Item.Meta
                            avatar={<Avatar src={user.avatar} />}
                            title={user.username}
                            description={
                                <Tooltip title={`邮箱: ${user.email}\n电话: ${user.phone}`}>
                                more
                                </Tooltip>
                            }
                            />
                        </List.Item>
                        )}
                    />
                    <br />
                    <div style={{ textAlign: 'right' }}>
                        <Button type='primary' onClick={this.addUser} disabled={this.state.selectedUserId === 0}>添加好友</Button>
                    </div>
                    <br /><br /><hr /><br /><br />
                </Modal>
                <Modal title="群组信息" visible={this.state.hasGroup} onCancel={this.handleCancel} okText="添加群组" footer={null}>
                    <Input.Group compact>
                        <Input.Search allowClear style={{ width: '100%' }} onSearch={this.searchGroup} />
                    </Input.Group>
                    <List
                        dataSource={this.state.queryUsers}
                        renderItem={(user) => (
                        <List.Item onClick={() => this.ChooseUser(user)}
                        style={{ backgroundColor: user.id === this.state.selectedUserId ? 'lightblue' : 'inherit' }}>
                            <List.Item.Meta
                            avatar={<Avatar src={user.avatar} />}
                            title={user.username}
                            description={user.desc}
                            />
                        </List.Item>
                        )}
                    />
                    <br />
                    <div style={{ textAlign: 'right' }}>
                        <Button type='primary' onClick={this.joinGroup} disabled={this.state.selectedUserId === 0}>添加群</Button>
                    </div>
                </Modal>
                

                <Modal title="创建群" visible={this.state.showCreateGroup} onCancel={this.handleCancelGroup} onOk={this.createGroup} okText="创建群">
                    <Form
                        name="groupForm"
                        ref={this.groupForm}
                        layout="vertical"
                        autoComplete="off"
                    >
                        <Form.Item
                            name="groupName"
                            label="群名称"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="群名称" />
                        </Form.Item>
                        <Form.Item
                            name="groupDescription"
                            label="描述"
                        >
                            <Input.TextArea placeholder="描述" />
                        </Form.Item>
                        <Form.Item
                            name="groupAvatar"
                            label="群头像"
                        >
                            <Upload
                                fileList={fileList}
                                beforeUpload={this.handleBeforeUpload}
                                customRequest={() => false}
                            >
                               {fileList.length > 0 ? (
                                    <img
                                    src={URL.createObjectURL(fileList[0])}
                                    alt="avatar"
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Button icon={<UploadOutlined />}>上传头像</Button>
                                )}
                            </Upload>
                        </Form.Item>
                    </Form>

                </Modal>
            </>
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
        setUser: (data) => dispatch(actions.setUser(data)),
        setUserList: (data) => dispatch(actions.setUserList(data)),
        setMenuType: (data) => dispatch(actions.setMenuType(data)),
        
    }
}

UserSearch = connect(mapStateToProps, mapDispatchToProps)(UserSearch)

export default UserSearch