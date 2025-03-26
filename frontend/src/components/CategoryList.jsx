import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { fetchCategories, selectCategories, selectCategoryStatus } from '../features/category/categorySlice';
// Import các ảnh mẫu
import shoe_1 from '../assets/images/shoe_1.webp';
import shoe_2 from '../assets/images/shoe_2.webp';
import shoe_3 from '../assets/images/shoe_3.webp';
import shoe_4 from '../assets/images/shoe_4.webp';
import shoe_5 from '../assets/images/shoe_5.webp';

const CategoryList = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const status = useSelector(selectCategoryStatus);

  // Danh sách ảnh mẫu để hiển thị cho danh mục
  const images = [shoe_1, shoe_2, shoe_3, shoe_4, shoe_5];

  // Gọi API lấy danh mục khi component được mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCategories());
    }
  }, [dispatch, status]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Danh mục</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <NavLink
            key={category._id}
            to={`/mystore?category=${category._id}`}
            className={({ isActive }) =>
              `block p-4 bg-gray-100 rounded-lg transition duration-300 transform hover:scale-105 hover:bg-blue-100 ${isActive ? 'bg-blue-600 text-white' : ''
              }`
            }
          >
            <div className="flex flex-col items-center">
              <img
                src={images[index % images.length]}
                alt={category.name}
                className="w-16 h-16 object-cover rounded-full mb-3"
              />
              <span className="text-center font-medium">{category.name}</span>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
