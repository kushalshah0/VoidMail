export default function FeatureCard({ icon, title, description, badge }) {
  return (
    <div className="card group hover:border-dark-700 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-600/10 border border-brand-600/20 
                        flex items-center justify-center text-2xl shrink-0
                        group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{title}</h3>
            {badge && <span className="badge-green text-[10px]">{badge}</span>}
          </div>
          <p className="text-dark-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
