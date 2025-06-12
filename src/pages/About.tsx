export function About() {
  const team = [
    { name: 'Phạm Đình Phương Sang', role: 'Thành viên' },
    { name: 'Võ Phạm Ý Nhi', role: 'Trưởng nhóm' },
    { name: 'Phạm Nhật Nam', role: 'Thành viên' },
    { name: 'Thái Lê Tường Vy', role: 'Thành viên' },
    { name: 'Trân Nguyễn Quyên', role: 'Thành viên' },
    { name: 'Nguyễn Thúy Vy', role: 'Thành viên' },
  ];

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-12 text-center text-gray-900 tracking-wide">
        Về chúng tôi
      </h1>

      <section className="text-center text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto space-y-6 px-4">
        <p className="font-semibold text-xl text-[#116466]">
          ALPHA – Cho thuê thiết bị và dụng cụ sự kiện, dã ngoại, livestream.
        </p>
        <p>
          Chúng tôi giúp bạn tiếp cận thiết bị chất lượng cao cho chụp hình, cắm trại, livestream hoặc sự kiện nhỏ.
        </p>
        <p className="mb-8">
          Đa dạng thiết bị, tiện lợi và phù hợp cho mọi nhu cầu.
        </p>
      </section>

      <section className="my-12 text-center text-gray-700">
        {/* Thêm hình ảnh hoặc video nếu muốn */}
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 mt-8">
          Đội ngũ của chúng tôi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-14 max-w-5xl mx-auto">
  {team.map((member, idx) => (
    <div
      key={idx}
      className="rounded-3xl p-8 shadow-lg text-center hover:shadow-2xl transition-shadow duration-300 cursor-default bg-white"
    >
      <div className="mx-auto mb-8 w-32 h-32 rounded-full bg-gradient-to-tr from-[#116466] via-[#3CAEA3] to-[#2B7A78] flex items-center justify-center text-white text-3xl font-bold">
        {member.name.charAt(0)}
      </div>
      <h3 className="text-xl font-semibold text-gray-900">
        {member.name}
      </h3>
      <p className="text-gray-600 mt-2">{member.role}</p>
    </div>
  ))}
</div>


      </section>
    </div>
  );
}

export default About;
