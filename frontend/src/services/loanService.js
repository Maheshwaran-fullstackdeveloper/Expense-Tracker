import API from "./api";

const getLoans = async () => {
  const response = await API.get("/loans");
  return response.data;
};

const createLoan = async (loanData) => {
  const response = await API.post("/loans", loanData);
  return response.data;
};

const updateLoan = async (id, loanData) => {
  const response = await API.put(`/loans/${id}`, loanData);
  return response.data;
};

const deleteLoan = async (id) => {
  const response = await API.delete(`/loans/${id}`);
  return response.data;
};

const loanService = {
  getLoans,
  createLoan,
  updateLoan,
  deleteLoan,
};

export default loanService;
