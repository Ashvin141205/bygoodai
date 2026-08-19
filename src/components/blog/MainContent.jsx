"use client"

import { useState, useEffect } from "react"
import BlogList from "./BlogList"
import Pagination from "./Pagination"
import Loading from "../Common/Loading"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { ApiHandler } from "../../helper/ApiHandler"
import { useDebounce } from "../../hooks/useDebounce"
import { logger } from "../../utils/logger"
import { API_ENDPOINTS, EXTRA_ENDPOINTS } from "../../config/apiEndpoints"

const MainContent = ({ id }) => {
  const [loadings, setLoadings] = useState(true)
  const [categories, setCategories] = useState([])
  const [blogs, setBlogs] = useState([])
  const [filteredBlogs, setFilteredBlogs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [selectedCategory, setSelectedCategory] = useState({
    id: "",
    name: "All Categories",
  })
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [isNextDisabled, setIsNextDisabled] = useState(false)
  const pageLimit = 8

  const token = useSelector((state) => state.auth.token)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchBlogs()
      await fetchCategories()
    }

    fetchData()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await ApiHandler(API_ENDPOINTS.BLOG.CATEGORIES_LIST, "GET", undefined, token, dispatch, navigate)
      if (response.data && response.data.status.code === 1) {
        const formattedCategories = response.data.data.map((cat) => ({
          id: cat.id,
          name: cat.cat_name,
        }))
        setCategories(formattedCategories)
      } else {
        logger.error("Error in response:", response.data.status.message)
        setCategories([])
      }
    } catch (error) {
      logger.error("Error fetching categories:", error)
      setCategories([])
    } finally {
      setLoadings(false)
    }
  }

  const fetchBlogs = async (categoryId = id ? id : "", page = currentPage) => {
    try {
      const response = await ApiHandler(
        EXTRA_ENDPOINTS.BLOG_LIST,
        "POST",
        {
          cat_id: categoryId,
          page: page,
        },
        token,
        dispatch,
        navigate,
      )

      if (response.data.status.code === 1) {
        const fetchedBlogs = response.data.data
        if (fetchedBlogs.length === 0 && currentPage > 1) {
          setIsNextDisabled(true)
        } else {
          setBlogs(fetchedBlogs)
          setIsNextDisabled(fetchedBlogs.length < pageLimit)
        }
      } else {
        setBlogs([])
        setIsNextDisabled(true)
      }
    } catch (error) {
      setBlogs([])
    } finally {
      setLoadings(false)
    }
  }

  useEffect(() => {
    let filtered = blogs

    if (debouncedSearchTerm) {
      filtered = filtered.filter((blog) => blog.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    }

    setFilteredBlogs(filtered)
  }, [debouncedSearchTerm, blogs])

  const handleChangeCategory = (categoryId, categoryName) => {
    setSelectedCategory({ id: categoryId, name: categoryName })
    setCurrentPage(0)
    fetchBlogs(categoryId, 0)
    setIsOpen(false)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchBlogs(selectedCategory.id, page)
  }

  if (loadings) return <Loading />
  return (
    <>
      <div className="container mx-auto py-5">
        <div className="w-full flex flex-wrap justify-between items-center p-3 text-white bg-[#1a1f2c] md:rounded-full">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1a1f2c] text-white p-2 rounded w-full max-w-sm outline-none focus:outline-none"
          />

          <div className="relative">
            <button
              id="dropdownDividerButton"
              onClick={toggleDropdown}
              className="text-white focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center outline-none focus:ring-0 bg-[#1a1f2c]"
              type="button"
              style={{ border: "0" }}
            >
              {selectedCategory.name || "All Categories"}
              <svg
                className="w-2.5 h-2.5 ms-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>

            {isOpen && (
              <div
                id="dropdownDivider"
                className="z-10  divide-y rounded-lg shadow w-52 bg-gray-700 divide-gray-600 absolute left-0 right-0"
                style={{ maxHeight: "300px", overflowY: "scroll" }}
              >
                <ul className="py-2 text-sm text-white" aria-labelledby="dropdownDividerButton">
                  <li onClick={() => handleChangeCategory("", "All Categories")}>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-600 hover:text-white">
                      All Categories
                    </a>
                  </li>
                  {categories.map((item) => (
                    <li key={item.id} onClick={() => handleChangeCategory(item.id, item.name)}>
                      <a href="#" className="block px-4 py-2  hover:bg-gray-600 hover:text-white">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <BlogList filteredBlogs={filteredBlogs} />

        {filteredBlogs.length > 0 && (
          <Pagination currentPage={currentPage} isNextDisabled={isNextDisabled} onPageChange={handlePageChange} />
        )}
      </div>
    </>
  )
}

export default MainContent
