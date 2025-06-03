/**
 * Asenkron fonksiyonlaru0131 sarmalayarak hata yu00f6netimini merkezi bir u015fekilde sauF0F1layan yu00f6ntem
 * @param {Function} fn - Asenkron fonksiyon
 * @returns {Function} Express middleware fonksiyonu
 */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
