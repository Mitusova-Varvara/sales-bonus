/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */

function calculateSimpleRevenue(purchase, products) {
  // @TODO: Расчет выручки от операции
  const { discount, sale_price, quantity } = purchase;
  return (revenue = sale_price * quantity * (1 - purchase.discount / 100));
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге
  const { profit } = seller;

  switch (index) {
    case 0:
      return profit * 0.15;
    case 1:
      return profit * 0.1;
    case 2:
      return profit * 0.1;
    case total - 1:
      return 0;
    default:
      return profit * 0.05;
  }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // Здесь проверим входящие данные
  // Сюда передадим функции для расчётов

  // Здесь посчитаем промежуточные данные и отсортируем продавцов

  // Вызовем функцию расчёта бонуса для каждого продавца в отсортированном массиве

  // Сформируем и вернём отчёт
  // @TODO: Проверка входных данных
  if (
    !data ||
    !Array.isArray(data.sellers) ||
    !Array.isArray(data.customers) ||
    !Array.isArray(data.products) ||
    !Array.isArray(data.purchase_records) ||
    data.sellers.length === 0 ||
    data.customers.length === 0 ||
    data.products.length === 0 ||
    data.purchase_records.length === 0 ||
    typeof options !== "object"
  ) {
    throw new Error("Некорректные входные данные");
  }
  // @TODO: Проверка наличия опций
  const { calculateRevenue, calculateBonus } = options;

  if (
    !calculateRevenue ||
    typeof calculateRevenue !== "function" ||
    typeof calculateBonus !== "function" ||
    !calculateBonus
  ) {
    throw new Error("Чего-то не хватает");
  }
  // @TODO: Подготовка промежуточных данных для сбора статистики
  const sellerStats = data.sellers.map((seller) => {
    return {
      id: seller.id,
      name: `${seller.first_name} ${seller.last_name}`,
      revenue: 0,
      profit: 0,
      sales_count: 0,
      products_sold: {},
    };
  });
  // @TODO: Индексация продавцов и товаров для быстрого доступа
  const sellerIndex = Object.fromEntries(
    sellerStats.map((item) => [item.id, item])
  );
  const productIndex = data.products.reduce(
    (result, item) => ({
      ...result,
      [item.sku]: item,
    }),
    {}
  );

  // @TODO: Расчет выручки и прибыли для каждого продавца

  data.purchase_records.forEach((record) => {
    // Чек
    const seller = sellerIndex[record.seller_id]; // Продавец
    // Увеличить количество продаж
    seller.sales_count++;
    seller.revenue += record.total_amount;

    // Увеличить общую сумму всех продаж
    // Расчёт прибыли для каждого товара
    record.items.forEach((item) => {
      const product = productIndex[item.sku]; // Товар
      let cost = product.purchase_price * item.quantity;
      let revenue = calculateRevenue(item, product);
      seller.profit += revenue - cost;
      // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
      // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
      // Посчитать прибыль: выручка минус себестоимость
      // Увеличить общую накопленную прибыль (profit) у продавца

      // Учёт количества проданных товаров
      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] = item.quantity;
      // По артикулу товара увеличить его проданное количество у продавца
    });
  });
  // @TODO: Сортировка продавцов по прибыли
  sellerStats.sort((a, b) => b.profit - a.profit);
  // @TODO: Назначение премий на основе ранжирования
  sellerStats.forEach((seller, index) => {
    seller.bonus = calculateBonus(index, sellerStats.length, seller);
    seller.top_products = Object.entries(seller.products_sold)
      .map((sold) => {
        [key, value] = sold;
        return { sku: key, quantity: value };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  });
  return sellerStats.map((seller) => ({
    seller_id: seller.id,
    name: seller.name,
    revenue: +seller.revenue.toFixed(2),
    profit: +seller.profit.toFixed(2),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +seller.bonus.toFixed(2),
  }));
  // Формируем топ-10 товаров
}
// @TODO: Подготовка итоговой коллекции с нужными полями
