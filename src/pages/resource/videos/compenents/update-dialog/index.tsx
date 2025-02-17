import React, { useState, useEffect } from "react";
import { Modal, Form, Input, message, TreeSelect } from "antd";
import { resource, resourceCategory } from "../../../../../api/index";

interface PropInterface {
  id: number;
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const VideosUpdateDialog: React.FC<PropInterface> = ({
  id,
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<any>([]);

  useEffect(() => {
    if (id === 0) {
      return;
    }
    if (open) {
      getCategory();
      getDetail();
    }
  }, [id, open]);

  const getCategory = () => {
    resourceCategory.resourceCategoryList().then((res: any) => {
      const categories = res.data.categories;
      if (JSON.stringify(categories) !== "{}") {
        const new_arr: any = checkArr(categories, 0, null);
        setCategories(new_arr);
      }
    });
  };

  const getDetail = () => {
    resource.videoDetail(id).then((res: any) => {
      let data = res.data.resources;
      form.setFieldsValue({
        name: data.name,
        category_id: res.data.category_ids,
      });
    });
  };

  const checkArr = (departments: any[], id: number, counts: any) => {
    const arr = [];
    for (let i = 0; i < departments[id].length; i++) {
      if (!departments[departments[id][i].id]) {
        arr.push({
          title: departments[id][i].name,
          value: departments[id][i].id,
        });
      } else {
        const new_arr: any = checkArr(
          departments,
          departments[id][i].id,
          counts
        );
        arr.push({
          title: departments[id][i].name,
          value: departments[id][i].id,
          children: new_arr,
        });
      }
    }
    return arr;
  };

  const onFinish = (values: any) => {
    if (Array.isArray(values.category_id)) {
      values.category_id = values.category_id[0];
    }
    resource.videoUpdate(id, values).then((res: any) => {
      message.success("保存成功！");
      onSuccess();
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <Modal
        title="编辑视频"
        centered
        forceRender
        open={open}
        width={416}
        onOk={() => form.submit()}
        onCancel={() => onCancel()}
        maskClosable={false}
      >
        <div className="float-left mt-24">
          <Form
            form={form}
            name="videos-update"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="视频分类"
              name="category_id"
              rules={[{ required: true, message: "请选择视频分类!" }]}
            >
              <TreeSelect
                showCheckedStrategy={TreeSelect.SHOW_ALL}
                allowClear
                style={{ width: 200 }}
                treeData={categories}
                placeholder="视频分类"
                treeDefaultExpandAll
              />
            </Form.Item>
            <Form.Item
              label="视频名称"
              name="name"
              rules={[{ required: true, message: "请输入视频名称!" }]}
            >
              <Input
                allowClear
                style={{ width: 200 }}
                placeholder="请输入视频名称"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};
