import React from 'react';
import {
    Tooltip,
    Button,
    Drawer,
    message,
    Modal
} from 'antd';

import {
    PhoneOutlined,
    PoweroffOutlined
} from '@ant-design/icons';

import * as Constant from '../../../common/constant/Constant'
import { connect } from 'react-redux'
import { actions } from '../../../redux/module/panel'

let localPeer = null;
class ChatAudioOline extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mediaPanelDrawerVisible: false,
            audioCallModal: false,
        }
    }

    componentDidMount() {
        localPeer = new RTCPeerConnection();
        let peer = {
            ...this.props.peer,
            localPeer: localPeer
        }
        this.props.setPeer(peer);
        // build basic webrtc conn: send candidate
        this.webrtcConnection();
    }
    /**
     * 开启语音电话
     */
    startAudioOnline = () => {
        if (!this.props.checkMediaPermisssion()) {
            return;
        }
        let media = {
            ...this.props.media,
            mediaConnected: false,
        }
        this.props.setMedia(media);
        this.setState({
            audioCallModal: true,
        })

        let data = {
            contentType: Constant.DIAL_AUDIO_ONLINE,
            type: Constant.MESSAGE_TRANS_TYPE,
        }
        this.props.sendMessage(data);
        this.audioIntervalObj = setInterval(() => {
            // 对方接受
            console.log(this.props.media.mediaReject)
            if (this.props.media && this.props.media.mediaConnected) {
                this.setMediaState();
                this.sendAudioData();
                return;
            }

            // 对方拒接
            if (this.props.media && this.props.media.mediaReject) {
                this.setMediaState();
                message.info("对方拒接")
                return;
            }
        }, 1000)
    }

    setMediaState = () => {
        this.audioIntervalObj && clearInterval(this.audioIntervalObj);
        this.setState({
            audioCallModal: false,
        })
        let media = {
            ...this.props.media,
            mediaConnected: false,
            mediaReject: false,
        }
        this.props.setMedia(media)
    }

    /**
    * webrtc 绑定事件
    */

    webrtcConnection = () => {

        /**
         * 对等方收到ice信息后，通过调用 addIceCandidate 将接收的候选者信息传递给浏览器的ICE代理。
         * @param {候选人信息} e 
         */
        localPeer.onicecandidate = (e) => {
            if (e.candidate) {
                // rtcType参数默认是对端值为answer，如果是发起端，会将值设置为offer
                let candidate = {
                    type: 'offer_ice',
                    iceCandidate: e.candidate
                }
                let message = {
                    content: JSON.stringify(candidate),
                    type: Constant.MESSAGE_TRANS_TYPE,
                }
                this.props.sendMessage(message);
            }

        };

        /**
         * 当连接成功后，从里面获取语音视频流
         * @param {包含语音视频流} e 
         */
        localPeer.ontrack = (e) => {
            console.log("on track")
            if (e && e.streams) {
                let remoteAudio = document.getElementById("remoteAudioPhone");
                remoteAudio.srcObject = e.streams[0];
            }
        };
    }

    /**
     * 停止语音电话
     */
    stopAudioOnline = () => {
        console.log("结束语音通话，需要关闭面板")
        let audioPhone = document.getElementById("remoteAudioPhone");
        if (audioPhone && audioPhone.srcObject && audioPhone.srcObject.getTracks()) {
            audioPhone.srcObject.getTracks().forEach((track) => track.stop());
        }
    }

    sendAudioData = () => {
        navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: false,
        }).then((stream) => {
            stream.getTracks().forEach(track => {
                localPeer.addTrack(track, stream);
            });

            // 一定注意：需要将该动作，放在这里面，即流获取成功后，再进行offer创建。不然不能获取到流，从而不能播放视频。
            localPeer.createOffer()
                .then(offer => {
                    localPeer.setLocalDescription(offer);
                    console.log("set offer into local peer", localPeer)
                    let data = {
                        contentType: Constant.AUDIO_ONLINE,  // 消息内容类型
                        content: JSON.stringify(offer),
                        type: Constant.MESSAGE_TRANS_TYPE,   // 消息传输类型
                    }
                    this.props.sendMessage(data);
                });
        }).catch(_error => {
            console.log('error', _error);
        });;

    this.setState({
        mediaPanelDrawerVisible: true
    })
    }

    mediaPanelDrawerOnClose = () => {
        this.setState({
            mediaPanelDrawerVisible: false
        })
    }

    handleCancel = () => {
        this.setState({
            audioCallModal: false,
        })
        let data = {
            contentType: Constant.CANCELL_AUDIO_ONLINE,
            type: Constant.MESSAGE_TRANS_TYPE,
        }
        this.props.sendMessage(data);
        this.videoIntervalObj && clearInterval(this.videoIntervalObj);
    }

    render() {
        const { chooseUser } = this.props;
        return (
            <>
                <Tooltip title="语音聊天">
                    <Button
                        shape="circle"
                        onClick={this.startAudioOnline}
                        style={{ marginRight: 10 }}
                        icon={<PhoneOutlined />}
                        disabled={chooseUser.toUser === ''}
                    />
                </Tooltip>

                <Drawer width='420px'
                    forceRender={true}
                    title="媒体面板"
                    placement="right"
                    onClose={this.mediaPanelDrawerOnClose}
                    visible={this.state.mediaPanelDrawerVisible}
                >
                    <Tooltip title="结束视频语音">
                        <Button
                            shape="circle"
                            onClick={this.stopAudioOnline}
                            style={{ marginRight: 10, float: 'right' }}
                            icon={<PoweroffOutlined style={{ color: 'red' }} />}
                        />
                    </Tooltip>
                    <br />

                    <audio id="remoteAudioPhone" autoPlay controls />
                </Drawer>

                <Modal
                    title="语音电话"
                    visible={this.state.audioCallModal}
                    onCancel={this.handleCancel}
                    cancelText="取消"
                >
                    <p>呼叫中...</p>
                </Modal>
            </>
        );
    }
}


function mapStateToProps(state) {
    return {
        chooseUser: state.panelReducer.chooseUser,
        socket: state.panelReducer.socket,
        peer: state.panelReducer.peer,
        media: state.panelReducer.media,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setMedia: (data) => dispatch(actions.setMedia(data)),
        setPeer: (data) => dispatch(actions.setPeer(data)),
    }
}

ChatAudioOline = connect(mapStateToProps, mapDispatchToProps)(ChatAudioOline)

export default ChatAudioOline