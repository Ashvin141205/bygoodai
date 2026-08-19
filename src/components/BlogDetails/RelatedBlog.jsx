import moment from 'moment'
import React from 'react'
import { Link } from 'react-router-dom'

const RelatedBlog = ({ relatedBlogs }) => {
  return (
    <>
      {relatedBlogs.length !== 0 && (
        <section className='mt-16'>
          <div className='font-extrabold text-4xl mb-8'>Related Blog</div>
          <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-x-10 gap-y-10 justify-items-center'>
            {
              relatedBlogs.map((blog, index) => {
                return (
                  <>
                    <Link key={index}
                      to={`/blog/${blog.id}`}
                      style={{
                        border: '1px solid rgb(45, 55, 72)',
                        borderRadius: '0.375rem'
                      }}
                    >
                      <div className='rounded-md p-4'>
                        <img src={blog.image} alt={blog.title} className="w-full h-[200px] object-contain" />
                      </div>
                      <div className='p-4'
                        style={{
                          background: '#1a1f2c',
                          borderRadius: ' 0 0 0.375rem 0.375rem'
                        }}>
                        <p className='text-white font-semibold text-base mt-1 line-clamp-2 min-h-[48px]'>
                          {blog.title}
                        </p>
                        <div className='flex justify-between items-center mt-2'>
                          <p className='text-[#CACACA] text-sm mt-3 font-medium'>By {blog.author}</p>
                          <p className='text-[#CACACA] text-sm mt-3 font-medium'>
                            {moment(blog.created_date).format('YYYY-MM-DD')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </>
                )
              })
            }
          </div>
        </section>
      )
      }
    </>
  )
}

export default RelatedBlog
