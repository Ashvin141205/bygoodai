import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Link, useNavigate } from 'react-router-dom';
import { ApiHandler } from '../../../../helper/ApiHandler';
import { useDispatch, useSelector } from 'react-redux';
import { EXTRA_ENDPOINTS } from '../../../../config/apiEndpoints';

const SystemMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#290A47',
        color: '#FFFFFF',
        fontSize: '17px',
        fontWeight: '700',
        textAlign: 'start',
      },
    },
    rows: {
      style: {
        backgroundColor: '#0E0E0E',
        color: '#FFFFFF',
        fontSize: '15px',
        fontWeight: '400'
      },
    },
    pagination: {
      style: {
        backgroundColor: '#222222',
        color: '#FFFFFF',
      },
    },
    noData: {
      style: {
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#0E0E0E',
        color: '#FFFFFF',
        fontSize: '16px',
      },
    },
  };
  
  const columns = [
    {
      name: '#',
      selector: row => row.id,
      sortable: true,
    },
    {
      name: 'Subject',
      selector: row => row.title,
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => row.created_date,
      sortable: true,
    },
    {
      name: 'Action',
      cell: row => <Link to={`/user/message/system/${row.id}`}  className="text-blue-500">Browse</Link>,
    },
  ];

  const fetchMessages = async () => {
    try {
      const response = await ApiHandler(EXTRA_ENDPOINTS.SYSTEM_MESSAGES, 'POST', undefined, token, dispatch, navigate);
      if (response.data.status.code === 1) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching system messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="p-4 main-dot-bg text-white rounded-lg shadow-lg min-h-screen">
      <h2 className="text-2xl mb-4">System Messages</h2>

      <div className='py-10'>
        {messages.length > 0 ? (
          <DataTable
            data={messages}
            columns={columns}
            customStyles={customStyles}
            className="table-bordered table-responsive"
            responsive
            progressPending={loading}
            progressComponent={<h6 className='py-10 bg-[#0E0E0E] text-white font-bold w-full flex items-center justify-center border'>Processing data..........</h6>}
            pagination
          />
        ) : (
          <>
            <div className='relative bg-[#222222] text-[16px]'>
              <table className='w-full' >
                <thead className='h-[50px]'>
                  <tr className='bg-[#290A47] text-white py-4'>
                    {columns.map((column) => (

                      !column.omit &&
                      <th key={column.name} className='text-[16px]'>{column.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className='h-[50vh]'>
                  <tr style={{ textAlign: 'center', backgroundColor: '#0E0E0E' }}>
                    <td colSpan={columns.length} style={{ padding: '8px 5px' }}>No data available in table</td>
                  </tr>
                </tbody>
              </table>
              <div className="d_processing" style={{ display: loading ? 'block' : 'none' }}>Processing...</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SystemMessages;
