/**
 * 首页
 */
import React from 'react';
import './index.less';
import { Table, Pagination, Button, Input, Message, Dialog } from 'element-react';
import request from '../../services/request';

interface iState {
    count: number;
    list: any[];
    dialogVisible: boolean;
    modelName: string;
}

export default class extends React.Component<iReactRoute, iState> {
    constructor(props: any) {
        super(props);
        this.state = {
            dialogVisible: false,
            count: 0,
            list: [],
            modelName: '',
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
            width: 210,
            prop: 'createdAt',
        },
        {
            label: '操作',
            width: 230,
            render: (row: any) => {
                return (
                    <Button.Group>
                        <Button onClick={() => this.goDetail(row.uuid)} type="primary" size="small">
                            查看客户端
                        </Button>
                        <Button onClick={() => this.goMsg(row.uuid)} type="success" size="small">
                            历史消息
                        </Button>
                        <Button onClick={() => this.del(row.id)} type="danger" size="small">
                            删除
                        </Button>
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
}
