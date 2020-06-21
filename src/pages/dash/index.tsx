/**
 * 首页
 */
import React from 'react';
import './index.less';
import { Table, Pagination, Button, Input, Message, Dialog } from 'element-react';
import request from '../../services/request';

interface IPushModel {
    [index: string]: string;
    uuid: string;
    name: string;
    title: string;
    txts: string;
    link: string;
}
interface iState {
    count: number;
    list: any[];
    dialogVisible: boolean;
    modelName: string;
    showPusbox: boolean;
    pushModel: IPushModel;
}

export default class extends React.Component<iReactRoute, iState> {
    constructor(props: any) {
        super(props);
        this.state = {
            dialogVisible: false,
            count: 0,
            list: [],
            modelName: '',
            showPusbox: false,
            pushModel: {
                uuid: '',
                name: '',
                title: '',
                txts: '',
                link: '',
            },
        };
    }

    columns = [
        {
            label: 'id',
            prop: 'id',
            width: 90,
        },
        {
            label: '图标',
            prop: 'logo',
            width: 90,
            render: () => {
                return <img className="project_logo" src="https://img5.daling.com/zin/public/specialTopic/2020/06/20/18/44/22/525400B9EA93HWRJF000008056333.png" alt="" />;
            },
        },
        {
            label: '项目名称',
            prop: 'name',
        },
        {
            label: 'push地址',
            prop: 'name',
            render: (row: any) => {
                return <div>/api/open/{row.uuid}</div>;
            },
        },
        {
            label: '创建日期',
            width: 180,
            prop: 'createdAt',
            render: (row: any) => {
                if (!row.createdAt) return '';
                return row.createdAt.split('.')[0];
            },
        },
        {
            label: '操作',
            width: 270,
            render: (row: any) => {
                return (
                    <Button.Group>
                        <Button onClick={() => this.goDetail(row.uuid)} type="primary" size="small">
                            查看客户端
                        </Button>
                        <Button onClick={() => this.goMsg(row.uuid)} type="success" size="small">
                            历史消息
                        </Button>
                        <Button onClick={() => this.handlepush(row)} type="warning" size="small">
                            发送
                        </Button>
                        <Button icon="close" onClick={() => this.del(row.id)} type="danger" size="small"></Button>
                    </Button.Group>
                );
            },
        },
    ];
    render() {
        return (
            <div id="dash">
                <div>
                    <Button className="btn_add" type="primary" icon="plus" onClick={this.handleClick} size="small">
                        新增
                    </Button>
                </div>
                <Table style={{ width: '100%' }} columns={this.columns} data={this.state.list} border={true} />
                <div className="foot">
                    <Pagination onCurrentChange={this.onCurrentChange} layout="prev, pager, next" pageSize={20} small={true} total={this.state.count} />
                </div>
                <Dialog title="添加新的项目" size="tiny" visible={this.state.dialogVisible} onCancel={() => this.setState({ dialogVisible: false })}>
                    <Dialog.Body>
                        <Input value={this.state.modelName} onChange={(e) => this.onChange(e)}></Input>
                    </Dialog.Body>
                    <Dialog.Footer className="dialog-footer">
                        <Button onClick={() => this.addProject()} type="primary">
                            添加
                        </Button>
                    </Dialog.Footer>
                </Dialog>
                <Dialog title={'给[' + this.state.pushModel.name + ']发送消息'} size="tiny" visible={this.state.showPusbox} onCancel={() => this.setState({ showPusbox: false })}>
                    <Dialog.Body>
                        <Input value={this.state.pushModel.title} onChange={(e: any) => this.changeModel('title', e)} placeholder="请填写合适的标题"></Input>
                        <div className="hang"></div>
                        <Input value={this.state.pushModel.txts} onChange={(e: any) => this.changeModel('txts', e)} placeholder="请填写合适的内容"></Input>
                        <div className="hang"></div>
                        <Input value={this.state.pushModel.link} onChange={(e: any) => this.changeModel('link', e)} placeholder="请填写链接"></Input>
                    </Dialog.Body>
                    <Dialog.Footer className="dialog-footer">
                        <Button onClick={() => this.pushMsg()} type="primary">
                            添加
                        </Button>
                    </Dialog.Footer>
                </Dialog>
            </div>
        );
    }
    componentDidMount() {
        this.getList();
    }
    onChange(modelName: any) {
        this.setState({
            modelName,
        });
    }

    pageIndex = 1;
    async getList(pageIndex?: number) {
        if (pageIndex && !isNaN(pageIndex)) {
            this.pageIndex = pageIndex;
        }
        try {
            const data = await request.get('/project', { pageIndex: this.pageIndex });
            this.setState({
                count: data.count,
                list: data.rows,
            });
        } catch (error) {
            console.log(error);
        }
    }
    onCurrentChange = (pageIndex: number) => {
        this.getList(pageIndex);
    };

    changeModel = (key: string, val: string) => {
        let model = this.state.pushModel;
        model[key] = val;
        this.setState({ pushModel: model });
    };
    handleClick = () => {
        this.setState({
            dialogVisible: true,
            modelName: '',
        });
    };

    goDetail(id: number) {
        this.props.history.push('/dash/client?id=' + id);
    }
    goMsg(id: number) {
        this.props.history.push('/dash/msg?id=' + id);
    }

    async addProject() {
        try {
            await request.post('/project/add', { name: this.state.modelName });
            this.setState({
                dialogVisible: false,
                modelName: '',
            });
            Message.success('添加成功');
            this.getList();
        } catch (error) {
            console.log(error.message);
            Message.error('添加失败');
        }
    }

    async del(id: number) {
        try {
            await request.post('/project/del', { id });
            Message.success('已删除');
            this.getList();
        } catch (error) {
            console.log(error.message);
            Message.error('删除失败');
        }
    }

    handlepush = (data: any) => {
        this.setState({
            showPusbox: true,
            pushModel: {
                uuid: data.uuid,
                name: data.name,
                title: '',
                txts: '',
                link: '',
            },
        });
    };

    async pushMsg() {
        console.log(this.state.pushModel);
        try {
            await request.post('/open/push/' + this.state.pushModel.uuid, this.state.pushModel);
        } catch (error) {
            console.log(error);
        }
        Message.success('发送成功');
        this.setState({
            showPusbox: false,
            pushModel: {
                uuid: '',
                name: '',
                title: '',
                txts: '',
                link: '',
            },
        });
    }
}
