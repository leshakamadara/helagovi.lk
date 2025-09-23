import React, { useEffect } from "react";

function PreapprovalForm({ preapprovalData }) {
  const { url, params } = preapprovalData;

  useEffect(() => {
    document.forms["payhereForm"].submit(); // auto-submit
  }, []);

  return (
    <form
      name="payhereForm"
      method="POST"
      action={url}
      style={{ display: "none" }}
    >
      {Object.entries(params).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
    </form>
  );
}

export default PreapprovalForm;
