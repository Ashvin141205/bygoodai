import React from 'react';
import DataTable from 'react-data-table-component';

function renderDataTable(
  filteredData,
  column,
  pending,
  currentPage,
  setPageLimit,
  setCurrentPage,
  totalPages,
  pageLimit,
  setResetSearch,
) {
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

  return (
    <div>
      {filteredData.length > 0 ? (
        <DataTable
          data={filteredData}
          columns={column}
          customStyles={customStyles}
          className="table-bordered table-responsive"
          responsive
          progressPending={pending}
          progressComponent={<h6 className='py-10 bg-[#0E0E0E] text-white font-bold w-full flex items-center justify-center border'>Processing data..........</h6>}
          pagination
          paginationServer
          paginationTotalRows={totalPages}
          paginationPerPage={pageLimit}
          onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
            setPageLimit(currentRowsPerPage);
            setCurrentPage(currentPage);
            setResetSearch((prevReset) => !prevReset);
          }}
          paginationDefaultPage={currentPage}
          onChangePage={(page) => { setCurrentPage(page); setResetSearch((prevReset) => !prevReset); }}
        />
      ) : (
        <>
          <div className='relative bg-[#222222] text-[16px]'>
            <table className='w-full' >
              <thead className='h-[50px]'>
                <tr className='bg-[#290A47] text-white py-4'>
                  {column.map((column) => (

                    !column.omit &&
                    <th key={column.name} className='text-[16px]'>{column.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='h-[50vh]'>
                <tr style={{ textAlign: 'center', backgroundColor: '#0E0E0E' }}>
                  <td colSpan={column.length} style={{ padding: '8px 5px' }}>No data available in table</td>
                </tr>
              </tbody>
            </table>
            <div className="d_processing" style={{ display: pending ? 'block' : 'none' }}>Processing...</div>
          </div>
        </>
      )}
    </div>
  );
}

export default renderDataTable;

