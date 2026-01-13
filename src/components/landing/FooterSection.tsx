import Icon from '@/components/ui/icon';

export const FooterSection = () => {
  return (
    <div className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <div className="space-y-2 text-slate-400">
              <a href="mailto:info@298100.ru" className="block hover:text-white transition-colors">
                <Icon name="Mail" size={16} className="inline mr-2" />
                info@298100.ru
              </a>
              <a href="tel:+79787236035" className="block hover:text-white transition-colors">
                <Icon name="Phone" size={16} className="inline mr-2" />
                +7 (978) 723-60-35
              </a>
              <p className="flex items-start">
                <Icon name="MapPin" size={16} className="inline mr-2 mt-1 flex-shrink-0" />
                <span>Республика Крым, г. Феодосия</span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Документы</h3>
            <div className="space-y-2 text-slate-400">
              <a href="#" className="block hover:text-white transition-colors">
                Политика конфиденциальности
              </a>
              <a href="#" className="block hover:text-white transition-colors">
                Пользовательское соглашение
              </a>
              <a href="#" className="block hover:text-white transition-colors">
                Оферта
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Реквизиты</h3>
            <div className="space-y-2 text-slate-400">
              <p>Плательщик НПД</p>
              <p>Прохоров С. В.</p>
              <p>ИНН: 910800040469</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} Прохоров С. В. Все права защищены.</p>
        </div>
      </div>
    </div>
  );
};