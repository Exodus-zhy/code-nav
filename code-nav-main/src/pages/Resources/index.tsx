import React, {FC, useEffect, useState} from 'react';
import {Button, Card, Cascader, Empty, Form, Input, List, Radio, Result} from 'antd';
import {PageContainer} from '@ant-design/pro-layout';
import {connect, Link} from 'umi';
import TagSelect from "@/pages/Resources/TagSelect";
import {ConnectState} from "@/models/connect";
import {ResourceType} from "@/models/resource";
import ResourceCard from "@/components/ResourceCard";
import {ResourceSearchParams, searchByPage} from "@/services/resource";
import {MenuOutlined, RiseOutlined, TagsOutlined} from "@ant-design/icons/lib";
import {CurrentUser} from "@/models/user";
import {stringify} from "querystring";
import styles from "@/pages/Recommend/style.less";
import cardListStyles from "@/cardList.less";
import {MOCK_FORMS} from "../../../mock/forms";
import {MOCK_TAGS} from "../../../mock/tags";

interface ResourcesProps {
  match: any;
  location: {
    pathname: string;
  };
  currentUser?: CurrentUser;
}

const formItemLayout = {
  labelCol: {
    sm: {
      span: 4,
    },
    lg: {
      span: 3,
    },
    xl: {
      span: 2,
    },
  },
  wrapperCol: {
    sm: {
      span: 12,
    },
    lg: {
      span: 9,
    },
    xl: {
      span: 7,
    },
  },
};

const Resources: FC<ResourcesProps> = (props) => {

  const {match, currentUser = {} as CurrentUser} = props;
  const initSearchParams: ResourceSearchParams = {
    name: '',
    form: '',
    category: match.params.category === 'all' ? '' : match.params.category,
    pageSize: 12,
    pageNum: 1,
  };
  const [searchParams, setSearchParams] = useState<ResourceSearchParams>(initSearchParams);
  const [total, setTotal] = useState<number>(0);
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [form] = Form.useForm();

  useEffect(() => {
    scrollTo({
      top: 0
    })
    setSearchParams(initSearchParams);
    doSearch(initSearchParams);
  }, [match.params.category])

  const doSearch = (params: ResourceSearchParams) => {
    setLoading(true);
    searchByPage({...params}).then(res => {
      setResources(res.data);
      setTotal(res.total);
    }).finally(() => {
      setLoading(false);
    })
  }

  const handleTabChange = (key: string) => {
    const params = key === searchParams.form ? {...searchParams, form: ''} : {...searchParams, form: key};
    setSearchParams(params);
    doSearch(params);
  };

  const handleFormSubmit = (value: any, event: any) => {
    doSearch({
      ...searchParams,
      name: value,
    });
  };

  const handleFormEnterSubmit = (e: any) => {
    doSearch(searchParams);
  }

  const handleValuesChange = (changedValues: any) => {
    // ??????????????????????????????
    if (changedValues.category) {
      changedValues.category = changedValues.category[changedValues.category.length - 1];
    }
    const params = {...searchParams, ...changedValues,};
    setSearchParams(params);
    doSearch(params);
  };

  // todo ??????????????????
  const forms = MOCK_FORMS;
  const tags = MOCK_TAGS;

  const tabList = forms && forms.map(form => {
    return {
      key: form.key,
      tab: form.name,
    }
  });

  const tagSelectView = tags && tags.map(tag => {
    return <TagSelect.Option key={tag.name} value={tag.name}>{tag.name}</TagSelect.Option>
  });

  const noMatch = (
    <Result
      status={403}
      title="403"
      subTitle="????????????????????????????????????"
      extra={
        <Button type="primary" size="large">
          <Link to={{
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            })
          }}>
            ??????
          </Link>
        </Button>
      }
    />
  );

  const mainSearch = (
    <div style={{textAlign: 'center'}}>
      <Input.Search
        placeholder="??????????????????"
        enterButton="??????"
        size="large"
        value={searchParams.name}
        loading={loading}
        allowClear
        onChange={e => setSearchParams({...searchParams, name: e.target.value})}
        onSearch={handleFormSubmit}
        onPressEnter={handleFormEnterSubmit}
        style={{maxWidth: 522, width: '100%'}}
      />
    </div>
  );

  const content = (
    <div className={styles.pageHeaderContent}>
      <div style={{marginBottom: '16px'}}>?????????????????? {total} ?????????</div>
      {mainSearch}
    </div>
  );

  return (
    currentUser._id ?
      <PageContainer
        content={content}
        tabList={tabList}
        tabProps={{
          tabBarGutter: 40,
        }}
        tabActiveKey={searchParams.form}
        onTabChange={handleTabChange}
      >
        <Card bordered={false} bodyStyle={{paddingBottom: 0}}>
          <Form
            {...formItemLayout}
            form={form}
            onValuesChange={handleValuesChange}
            initialValues={{
              orderKey: '_createTime',
            }}
            labelAlign='left'
          >
            {
              match.params.category === 'all' ? <Form.Item
                label={<><MenuOutlined /> <span style={{marginLeft: 8}}>??????</span></>}
                name="category"
                labelAlign="left"
              >
                <Cascader
                  expandTrigger="hover"
                  allowClear
                />
              </Form.Item> : null
            }
            <Form.Item
              label={<><TagsOutlined /> <span style={{marginLeft: 8}}>??????</span></>}
              name="tags"
              labelAlign="left"
              wrapperCol={{}}
            >
              <TagSelect hideCheckAll expandable>
                {tagSelectView}
              </TagSelect>
            </Form.Item>
            <Form.Item
              label={<><RiseOutlined /> <span style={{marginLeft: 8}}>??????</span></>}
              name="orderKey"
            >
              <Radio.Group>
                <Radio.Button value="_createTime">????????????</Radio.Button>
                <Radio.Button value="likeNum">?????????</Radio.Button>
                <Radio.Button value="shareNum">?????????</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Form>
        </Card>
        <br />
        <div className={resources && resources.length > 0 ? cardListStyles.cardList : ''}>
          <List<ResourceType>
            rowKey="id"
            loading={loading}
            dataSource={resources}
            pagination={{
              pageSize: searchParams.pageSize ?? 12,
              current: searchParams.pageNum ?? 1,
              showSizeChanger: false,
              total,
              onChange(pageNum, pageSize) {
                const params = {
                  ...searchParams,
                  pageSize,
                  pageNum,
                };
                setSearchParams(params);
                doSearch(params);
              },
            }}
            locale={{
              emptyText: <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description='????????????'
              >
                <Link to='/addResource'><Button type="primary" size='large'>?????????????????????</Button></Link>
              </Empty>,
            }}
            renderItem={(item) => {
              return (
                <List.Item key={item._id}>
                  <ResourceCard resource={item} loading={loading} />
                </List.Item>
              );
            }}
          />
        </div>
      </PageContainer> : noMatch
  );
}

export default connect(({user}: ConnectState) => ({
  currentUser: user.currentUser,
}))(Resources);

