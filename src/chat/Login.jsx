import React from 'react';
import {
    Button,
    Form,
    Input,
    Drawer,
    message,
    Radio
} from 'antd';
import { axiosPostBody } from './util/Request';
import * as Params from './common/param/Params'

class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            registerDrawerVisible: false
        }

    }

    componentDidMount() {

    }

    onFinish = (values) => {
        let data = {
            username: values.username,
            password: values.password
        }
        axiosPostBody(Params.LOGIN_URL, data)
            .then(response => {
                message.success("登录成功！");
                localStorage.user_id = response.data.id
                localStorage.username = values.username
                localStorage.token = response.data.accessToken
                this.props.history.push("panel/" + response.data.id)
            });
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    showRegister = () => {
        this.setState({
            registerDrawerVisible: true
        })
    }

    registerDrawerOnClose = () => {
        this.setState({
            registerDrawerVisible: false
        })
    }

    onRegister = (values) => {
        values.sex = values.sex === 'male' ? 0 : 1;
        let data = {
            ...values
        }
        console.log(data)
        axiosPostBody(Params.REGISTER_URL, data)
            .then(_response => {
                message.success("注册成功！");
                this.setState({
                    registerDrawerVisible: false
                })
            });
    }

    render() {

        return (
            <div>
                <Form
                    name="basic"
                    labelCol={{ span: 9 }}
                    wrapperCol={{ span: 6 }}
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                    autoComplete="off"
                    style={{ marginTop: 150 }}
                >
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 9, span: 6 }}>
                        <Button type="primary" htmlType="submit">
                            登录
                        </Button>

                        <Button onClick={this.showRegister} style={{ marginLeft: 40 }}>
                            注册
                        </Button>
                    </Form.Item>

                </Form>

                <Drawer width='700px' forceRender={true} title="注册" placement="right" onClose={this.registerDrawerOnClose} visible={this.state.registerDrawerVisible}>
                    <Form
                        name="basic"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={this.onRegister}
                        autoComplete="off"
                        style={{ marginTop: 150 }}
                    >
                        <Form.Item
                            label="用户名"
                            name="username"
                            rules={[{ required: true, message: '用户名!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="密码"
                            name="password"
                            rules={[{ required: true, message: '密码!' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            label="再次确认密码"
                            name="confirm_password"
                            rules={[{ required: true, message: '昵称!' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            label="邮箱"
                            name="email"
                            rules={[{ required: true, message: '邮箱!' }]}
                        >
                            <Input />
                        </Form.Item>


                        <Form.Item
                            label="手机号"
                            name="phone"
                            rules={[{ required: true, message: '手机号!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="性别"
                            name="sex"
                            rules={[{ required: true, message: '请选择性别!' }]}
                        >
                            <Radio.Group>
                                <Radio value="male">男</Radio>
                                <Radio value="female">女</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 2, span: 6 }}>
                            <Button type="primary" htmlType="submit" style={{ marginLeft: 40 }}>
                                注册
                        </Button>
                        </Form.Item>

                    </Form>
                </Drawer>
            </div>
        );
    }
}

export default Login;