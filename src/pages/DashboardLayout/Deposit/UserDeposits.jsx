import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatMoment, onBlurDate, onFocusDate, submitDATE, tableDATE } from "../../../helper/CommonFunction";
import DataFetching from "../../../helper/DataFetching";
import renderDataTable from "../../../helper/renderDataTable";
import { EXTRA_ENDPOINTS } from "../../../config/apiEndpoints";


const UserDeposits = () => {

  const [filteredData, setFilteredData] = useState([]);

  const columns = [
    {
      name: 'Date Created',
      selector: (row) => formatMoment(row.created_date),
      sortable: true,
    },
    {
      name: 'Total Price',
      selector: (row) => row.user_balance,
      sortable: true,
    },
    {
      name: 'Status',
      // Pending, Expired, Cancelled, Completed, Paid, Unpaid
      selector: row => row.payment_status === "0" ? (
        <p className='text-[#F8924F]'>Pending</p>
      ) : row.payment_status === "3" ? (
        <p className='text-[#FF2B62]'>Expired</p>
      ) : row.payment_status === "2" ? (
        <p className='text-[#FF2B62]'>Cancelled</p>
      ) : row.payment_status === "1" ? (
        <p className='text-[#4AFFA9]'>Completed</p>
      ) : row.payment_status === "Paid" ? (
        <p className='text-[#9EE2FF]'>Paid</p>
      ) : row.payment_status === "Unpaid" ? (
        <p className='text-[#8F96FF]'>Unpaid</p>
      ) : (
        <></>
      ),
      sortable: true,
    },
    {
      name: 'Action',
      cell: (row) => <Link to={`/user/deposits/${row.id}/${row.order_id}`} className='underline text-[#01D370] bg-[#0E0E0E]'>View</Link>,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const [user, setUser] = useState({
    totalPrice: '',
    status: '',
  })
  const { totalPrice, status } = user;

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const location = useLocation();
  const [pending, setPending] = useState(true);
  const [resetSearch, setResetSearch] = useState(true);
  const [hide, setHide] = useState('');
  const [from, setFrom] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [form_date, setForm_date] = useState(null);
  const [end_date, setEnd_date] = useState(null);
  const [form_date1, setForm_date1] = useState('');
  const [end_date1, setEnd_date1] = useState('');

  const fetchData = async () => {
    setPending(true)

    const body = {
      fromDate: form_date1,
      toDate: end_date1,
      total_price: totalPrice,
      payment_status: status,
      page: currentPage - 1,
      total_record: pageLimit
    }
    DataFetching(setPending, EXTRA_ENDPOINTS.DEPOSIT_TRANSACTION_HISTORY, 'POST', token, dispatch, navigate, setFilteredData, setTotalPages, body, setResetSearch, resetSearch);
  };

  const handleSearchClick = () => {
    if (form_date) {
      if (!end_date) {
        setHide("This field is required")
        return;
      }
    }
    if (hide || from) {
      return;
    }
    setCurrentPage(1)
    setResetSearch((prevReset) => !prevReset);
  };

  const handleClearSearch = () => {
    setHide('')
    setFrom(false);
    clearSearchData();
    setResetSearch((prevReset) => !prevReset);
  }
  const clearSearchData = () => {
    setUser({
      totalPrice: '',
      status: '',
    })
    setForm_date(null);
    setForm_date1('');
    setEnd_date(null);
    setEnd_date1('');
  };

  // Render the DataTable component
  useEffect(() => {
    if (!resetSearch) {
      return;
    }
    fetchData();
  }, [currentPage, pageLimit, location, resetSearch]);


  return (
    <div className="p-4 main-dot-bg text-white shadow-lg min-h-screen">
      <h2 className="text-2xl mb-4">Deposit</h2>

      <div className='p-5 mb-4 rounded-lg'>
        <p className='text-xl mb-2'>Filter:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className='w-full'>
            <div className='text-white text-sm font-medium mb-2'>By From Transaction Date</div>
            <DatePicker
              selected={form_date}
              placeholderText="From Date"
              className={`px-4 h-[40px] text-start bg-[#0E0E0E] text-white rounded fill-white outline-none focus:outline-none w-full ${from ? "border border-red-500 placeholder:text-red-400 font-extrabold" : ""}`}
              onChange={(date) => tableDATE(date, setForm_date, setForm_date1, end_date, setFrom)}
              dateFormat="yyyy-MM-dd"
              onFocus={() => onFocusDate(setHide)}
              onBlur={() => onBlurDate(setHide, form_date, end_date)}
            />
          </div>
          <div className='w-full'>
            <div className='text-white text-sm font-medium mb-2'>By To Transaction Date</div>
            <DatePicker
              selected={end_date}
              onChange={(date) => {
                submitDATE(
                  date, setHide, setEnd_date, setEnd_date1, setFrom, form_date
                )
              }}
              dateFormat="yyyy-MM-dd"
              placeholderText="To Date"
              className={`px-4 h-[40px] text-start bg-[#0E0E0E] text-white rounded fill-white outline-none focus:outline-none w-full ${hide ? "border border-red-500 placeholder:text-red-400 font-extrabold" : ""}`}
              minDate={form_date}
            />
            {hide && <div style={{ color: 'red', display: 'block', fontWeight: '500' }}>{hide}</div>}
          </div>
          <div className='w-full'>
            <p className='text-white text-sm font-medium mb-2'>Total Price</p>
            <input
              type="text"
              name="totalPrice"
              placeholder="Search by Total Price"
              value={totalPrice}
              onChange={(e) => onInputChange(e)}
              className="px-4 h-[40px] text-start bg-[#0E0E0E] text-white rounded outline-none focus:outline-none placeholder:text-white w-full"
            />
          </div>
          <div className='w-full'>
            <p className='text-white text-sm font-medium mb-2'>Transaction Status </p>
            <select
              name="status"
              value={status}
              onChange={(e) => onInputChange(e)}
              className="px-4 h-[40px] text-start bg-[#0E0E0E] text-white rounded outline-none focus:outline-none placeholder:text-white w-full"
            >
              <option value="">Search by Status</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        <div className='flex gap-3 justify-end mt-4'>
          <button
            onClick={handleSearchClick}
            className="mb-4 px-4 py-2 bg-[#5C6CB2] rounded text-white hover:bg-blue-700"
          >
            Search
          </button>
          <button
            onClick={handleClearSearch}
            className="mb-4 px-4 py-2 bg-[#6C6C6C] rounded text-white hover:bg-slate-600"
          >
            Clear
          </button>
        </div>
      </div>

      {renderDataTable(
        filteredData,
        columns,
        pending,
        currentPage,
        setPageLimit,
        setCurrentPage,
        totalPages,
        pageLimit,
        setResetSearch,
      )}
    </div>

  );
}

export default UserDeposits;
