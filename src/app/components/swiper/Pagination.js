const pagination = {
  clickable: true,
  renderBullet: function (index, className) {
    return (
      `<span id="pagination-${index}" class="${className}"></span>`
    );
  },
};

export default pagination;