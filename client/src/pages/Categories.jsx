  import React, { useState, useEffect } from "react";
import { Folder, FolderOpen, Plus, Pencil, Trash2, Search, X, ChevronRight, ChevronDown, Image as ImageIcon } from "lucide-react";
import { categoryService, uploadService } from "../services";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // Form states
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    level: 1,
    image: ""
  });
  const [saving, setSaving] = useState(false);

  // Tree view state
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      
      if (response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (err) {
      setError("Không thể tải danh sách danh mục");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadService.uploadCategoryImage(file);
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          image: response.data.image.url
        }));
      }
    } catch (err) {
      alert("Upload ảnh thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      parent: "",
      level: 1,
      image: ""
    });
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      parent: category.parent || "",
      level: category.level || 1,
      image: category.image || "",
      _id: category._id
    });
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Tên danh mục không được để trống!");
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        level: parseInt(formData.level) || 1,
        image: formData.image || undefined
      };

      if (formData.parent) {
        submitData.parent = formData.parent;
      }

      if (isEditing) {
        const response = await categoryService.updateCategory(formData._id, submitData);
        if (response.success) {
          fetchCategories();
          setIsFormVisible(false);
          alert("Cập nhật danh mục thành công!");
        }
      } else {
        const response = await categoryService.createCategory(submitData);
        if (response.success) {
          fetchCategories();
          setIsFormVisible(false);
          alert("Tạo danh mục mới thành công!");
        }
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?\n\nLưu ý: Hành động này không thể hoàn tác!`)) {
      try {
        const response = await categoryService.deleteCategory(id);
        if (response.success) {
          fetchCategories();
          alert("Xóa danh mục thành công!");
        }
      } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Build tree structure
  const buildTree = (cats) => {
    const catMap = {};
    const roots = [];

    // First pass: create map
    cats.forEach(cat => {
      catMap[cat._id] = { ...cat, children: [] };
    });

    // Second pass: build tree
    cats.forEach(cat => {
      if (cat.parent && catMap[cat.parent]) {
        catMap[cat.parent].children.push(catMap[cat._id]);
      } else {
        roots.push(catMap[cat._id]);
      }
    });

    return roots;
  };

  // Render tree node
  const renderTreeNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedCategories.has(node._id);
    const matchesSearch = search === "" || 
      node.name.toLowerCase().includes(search.toLowerCase()) ||
      (node.description || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch && search !== "") return null;

    return (
      <div key={node._id} className="mb-1">
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group ${
            level > 0 ? 'ml-' + (level * 6) : ''
          }`}
          style={{ marginLeft: level > 0 ? `${level * 1.5}rem` : '0' }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => hasChildren && toggleExpand(node._id)}
            className={`flex-shrink-0 ${hasChildren ? 'text-gray-600 hover:text-gray-900' : 'text-transparent'}`}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
            ) : (
              <div className="w-[18px]"></div>
            )}
          </button>

          {/* Icon/Image */}
          <div className="flex-shrink-0">
            {node.image ? (
              <img
                src={node.image}
                alt={node.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : hasChildren ? (
              isExpanded ? <FolderOpen className="text-blue-500" size={20} /> : <Folder className="text-blue-500" size={20} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-semibold">
                {node.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{node.name}</h4>
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                Level {node.level || 1}
              </span>
            </div>
            {node.description && (
              <p className="text-sm text-gray-500 truncate mt-1">{node.description}</p>
            )}
          </div>

          {/* Slug */}
          <div className="hidden md:block text-sm text-gray-400 font-mono">
            /{node.slug}
          </div>

          {/* Actions */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => handleEdit(node)}
              className="text-blue-600 hover:text-blue-900 transition p-1 hover:bg-blue-50 rounded"
              title="Chỉnh sửa"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDelete(node._id, node.name)}
              className="text-red-600 hover:text-red-900 transition p-1 hover:bg-red-50 rounded"
              title="Xóa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = search 
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        (cat.description || "").toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  const treeData = buildTree(filteredCategories);

  return (
    <div className="p-8 md:p-10 lg:p-12">
      {/* Header */}
      <header className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Quản lý Danh mục</h1>
            <p className="mt-2 text-gray-600">Tổ chức danh mục sản phẩm theo cấu trúc cây.</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Thêm danh mục
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Categories Tree */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">
              Danh sách danh mục ({categories.length})
            </h3>
            <button
              onClick={() => setExpandedCategories(new Set(categories.map(c => c._id)))}
              className="text-sm text-blue-600 hover:text-blue-900"
            >
              Mở rộng tất cả
            </button>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Folder size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có danh mục nào</p>
            </div>
          ) : treeData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Không tìm thấy danh mục phù hợp</p>
            </div>
          ) : (
            <div>
              {treeData.map(node => renderTreeNode(node))}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h3>
              <button
                onClick={() => setIsFormVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Nhập tên danh mục..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Nhập mô tả danh mục..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh danh mục
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {formData.image ? (
                        <img src={formData.image} alt="Category" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400 text-xs gap-1">
                          <ImageIcon size={18} />
                          <span>Chưa có ảnh</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 text-sm font-medium">
                        <ImageIcon size={16} />
                        {uploading ? 'Đang upload...' : 'Chọn ảnh'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục cha
                  </label>
                  <select
                    value={formData.parent}
                    onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">-- Không có (Level 1) --</option>
                    {categories
                      .filter(cat => !isEditing || cat._id !== formData._id)
                      .map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name} (Level {cat.level || 1})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <input
                    type="number"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    min="1"
                    max="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Level 1: Chính, Level 2: Phụ, Level 3: Chi tiết
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <strong>Lưu ý:</strong> Slug sẽ được tự động tạo từ tên danh mục.
              </div>
            </form>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setIsFormVisible(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
