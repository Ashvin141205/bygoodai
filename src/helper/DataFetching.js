import { ApiHandler } from "./ApiHandler";

const DataFetching = async (
    setLoding,
    url,
    method,
    token,
    dispatch,
    navigate,
    setFilteredData,
    setTotalPages,
    body,
    setResetSearch,
    resetSearch,
) => {
    setLoding(true);
    try {
        const result = await ApiHandler(url, method, body, token, dispatch, navigate);
        const statusCode = result?.data?.status?.code;
        if (statusCode === 1) {
            if (result?.data) {
                setFilteredData(result?.data.data?.history);
                setTotalPages(result?.data.data?.total_record_count);
            } else {
                setFilteredData([]);
            }
        } else {
            setFilteredData([]);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        setLoding(false);
        if (resetSearch) {
            setResetSearch(false);
        }
    }
};

export default DataFetching;
