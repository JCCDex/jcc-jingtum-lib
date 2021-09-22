import fetch from "./fetch";
const fetchSequence = async (node: string, address: string): Promise<number> => {
  const data: any = {
    data: {
      method: "account_info",
      params: [
        {
          account: address
        }
      ]
    },
    method: "post",
    url: node
  };
  const res: any = await fetch(data);
  const status = res?.result?.status;
  if (status !== "success") {
    throw new Error(res.result.error_message);
  }

  return res.result.account_data.Sequence;
};

const submitTransaction = async (node: string, blob: string): Promise<any> => {
  const data: any = {
    data: {
      method: "submit",
      params: [
        {
          tx_blob: blob
        }
      ]
    },
    method: "post",
    url: node
  };
  const res = await fetch(data);
  return res;
};

const fetchTransaction = async (node: string, hash: string): Promise<any> => {
  const data: any = {
    data: {
      method: "tx",
      params: [
        {
          binary: false,
          transaction: hash
        }
      ]
    },
    method: "post",
    url: node
  };
  const res = await fetch(data);
  return res;
};

const submitMultisignedTransaction = async (node: string, params: string): Promise<any> => {
  const data: any = {
    data: {
      method: "submit_multisigned",
      params: [
        {
          tx_json: params
        }
      ]
    },
    method: "post",
    url: node
  };
  const res = await fetch(data);
  return res;
};

export { fetchSequence, fetchTransaction, submitTransaction, submitMultisignedTransaction };
