const CODES = {
    laravel: {
        label: 'Laravel v11',
        color: 'bg-red-400',
        scripts: [
            {
                id: 'laravel-controller',
                label: 'REST API Controller',
                filename: 'ProductController.php',
                language: 'php',
                code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\StoreProductRequest;
use App\\Http\\Requests\\UpdateProductRequest;
use App\\Http\\Resources\\ProductResource;
use App\\Models\\Product;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with(['category', 'supplier'])
            ->active()
            ->when($request->search, fn($q, $s) => $q->where('nama_produk', 'like', "%{$s}%"))
            ->when($request->kategori_id, fn($q, $id) => $q->where('kategori_id', $id))
            ->when($request->min_harga, fn($q, $h) => $q->where('harga', '>=', $h))
            ->when($request->max_harga, fn($q, $h) => $q->where('harga', '<=', $h))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc');

        return ProductResource::collection(
            $query->paginate($request->per_page ?? 15)
        );
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create([
            ...$request->validated(),
            'kode_produk' => 'PRD-' . strtoupper(uniqid()),
            'created_by'  => auth()->id(),
        ]);

        $product->load(['category', 'supplier']);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan.',
            'data'    => new ProductResource($product),
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'supplier', 'stockHistory']);

        return response()->json([
            'success' => true,
            'data'    => new ProductResource($product),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diperbarui.',
            'data'    => new ProductResource($product->fresh(['category', 'supplier'])),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        if ($product->orderItems()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak dapat dihapus karena memiliki riwayat pesanan.',
            ], 422);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus.',
        ]);
    }
}`,
                explanation: {
                    title: 'Laravel v11 - REST API Controller',
                    overview: 'ProductController mengimplementasikan RESTful CRUD untuk manajemen produk toko online dengan fitur filter, relasi eager loading, dan validasi bisnis.',
                    points: [
                        'index() menggunakan query chaining dengan when() untuk filter kondisional yang bersih dan readable',
                        'store() memanfaatkan spread operator PHP 8.1+ untuk menggabungkan validated data dengan field auto-generated',
                        'destroy() melakukan pengecekan relasi sebelum hapus untuk menjaga integritas data',
                        'Semua response menggunakan API Resource untuk transformasi data yang konsisten',
                        'Type hints di setiap method signature meningkatkan code reliability dan IDE support'
                    ]
                },
                output: {
                    type: 'json',
                    meta: { status: 200, time: '42ms', rows: 15 },
                    data: {
                        success: true,
                        data: [
                            { id: 1, kode_produk: 'PRD-A1B2C3', nama_produk: 'Batik Tulis Premium Jogja', kategori: 'Pakaian', harga: 485000, stok: 120, supplier: 'CV Batik Nusantara', status: 'aktif' },
                            { id: 2, kode_produk: 'PRD-D4E5F6', nama_produk: 'Kopi Arabika Gayo 500gr', kategori: 'Makanan & Minuman', harga: 125000, stok: 340, supplier: 'PT Gayo Coffee', status: 'aktif' },
                            { id: 3, kode_produk: 'PRD-G7H8I9', nama_produk: 'Tenun Ikat NTT Asli', kategori: 'Kerajinan', harga: 750000, stok: 45, supplier: 'Kelompok Tenun Flores', status: 'aktif' }
                        ],
                        meta: { current_page: 1, per_page: 15, total: 3, last_page: 1 }
                    }
                }
            },
            {
                id: 'laravel-model',
                label: 'Eloquent Model',
                filename: 'Product.php',
                language: 'php',
                code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;
use Illuminate\\Database\\Eloquent\\SoftDeletes;
use Illuminate\\Database\\Eloquent\\Builder;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'kode_produk',
        'nama_produk',
        'deskripsi',
        'harga',
        'harga_modal',
        'stok',
        'stok_minimum',
        'kategori_id',
        'supplier_id',
        'satuan',
        'berat_gram',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'harga'        => 'integer',
        'harga_modal'  => 'integer',
        'stok'         => 'integer',
        'stok_minimum' => 'integer',
        'berat_gram'   => 'integer',
        'is_active'    => 'boolean',
        'deleted_at'   => 'datetime',
    ];

    protected $appends = ['margin_persen', 'status_stok'];

    public function getMarginPersenAttribute(): float
    {
        if (!$this->harga_modal || $this->harga_modal === 0) return 0;
        return round((($this->harga - $this->harga_modal) / $this->harga_modal) * 100, 2);
    }

    public function getStatusStokAttribute(): string
    {
        return match(true) {
            $this->stok === 0       => 'habis',
            $this->stok <= $this->stok_minimum => 'menipis',
            default                 => 'tersedia',
        };
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('stok', '<=', 'stok_minimum');
    }

    public function scopeByCategory(Builder $query, int $categoryId): Builder
    {
        return $query->where('kategori_id', $categoryId);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'kategori_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'produk_id');
    }

    public function stockHistory(): HasMany
    {
        return $this->hasMany(StockHistory::class, 'produk_id')
            ->latest()
            ->limit(10);
    }
}`,
                explanation: {
                    title: 'Laravel v11 - Eloquent Model',
                    overview: 'Model Product menggunakan fitur-fitur Eloquent modern untuk mendefinisikan struktur data, relasi, computed attributes, dan query scopes yang reusable.',
                    points: [
                        'SoftDeletes memastikan data tidak terhapus permanen, masih bisa di-restore jika diperlukan',
                        'Computed attributes margin_persen dan status_stok di-append otomatis ke setiap response JSON',
                        'match expression PHP 8 digunakan untuk logika status stok yang clean dan exhaustive',
                        'Query scopes (active, lowStock, byCategory) membuat filter reusable dan chainable di seluruh aplikasi',
                        'Relasi stockHistory dibatasi 10 record terbaru untuk performa yang optimal'
                    ]
                },
                output: {
                    type: 'json',
                    meta: { status: 200, time: '28ms', rows: 1 },
                    data: {
                        id: 1,
                        kode_produk: 'PRD-A1B2C3',
                        nama_produk: 'Batik Tulis Premium Jogja',
                        harga: 485000,
                        harga_modal: 320000,
                        stok: 120,
                        stok_minimum: 20,
                        satuan: 'pcs',
                        berat_gram: 350,
                        is_active: true,
                        margin_persen: 51.56,
                        status_stok: 'tersedia',
                        category: { id: 3, nama: 'Pakaian Tradisional' },
                        supplier: { id: 7, nama: 'CV Batik Nusantara', kota: 'Yogyakarta' }
                    }
                }
            },
            {
                id: 'laravel-request',
                label: 'Form Request',
                filename: 'StoreProductRequest.php',
                language: 'php',
                code: `<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;
use Illuminate\\Contracts\\Validation\\Validator;
use Illuminate\\Http\\Exceptions\\HttpResponseException;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->hasRole(['admin', 'manajer_produk']) ?? false;
    }

    public function rules(): array
    {
        return [
            'nama_produk'  => ['required', 'string', 'max:200', 'unique:products,nama_produk'],
            'deskripsi'    => ['nullable', 'string', 'max:2000'],
            'harga'        => ['required', 'integer', 'min:100', 'max:999999999'],
            'harga_modal'  => ['required', 'integer', 'min:100', 'lt:harga'],
            'stok'         => ['required', 'integer', 'min:0'],
            'stok_minimum' => ['required', 'integer', 'min:1', 'lte:stok'],
            'kategori_id'  => ['required', 'exists:categories,id'],
            'supplier_id'  => ['required', 'exists:suppliers,id'],
            'satuan'       => ['required', 'in:pcs,kg,liter,meter,lusin,kodi,karton'],
            'berat_gram'   => ['nullable', 'integer', 'min:1', 'max:50000'],
            'is_active'    => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_produk.unique'   => 'Nama produk sudah terdaftar di sistem.',
            'harga_modal.lt'       => 'Harga modal harus lebih rendah dari harga jual.',
            'stok_minimum.lte'     => 'Stok minimum tidak boleh melebihi stok awal.',
            'kategori_id.exists'   => 'Kategori yang dipilih tidak valid.',
            'supplier_id.exists'   => 'Supplier yang dipilih tidak valid.',
            'satuan.in'            => 'Satuan harus salah satu: pcs, kg, liter, meter, lusin, kodi, karton.',
        ];
    }

    public function attributes(): array
    {
        return [
            'nama_produk'  => 'nama produk',
            'harga'        => 'harga jual',
            'harga_modal'  => 'harga modal',
            'stok'         => 'stok awal',
            'stok_minimum' => 'stok minimum',
            'kategori_id'  => 'kategori',
            'supplier_id'  => 'supplier',
            'berat_gram'   => 'berat produk',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Data yang dikirim tidak valid.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}`,
                explanation: {
                    title: 'Laravel v11 - Form Request Validation',
                    overview: 'StoreProductRequest memisahkan logika validasi dari controller, menggunakan fitur validasi Laravel untuk memastikan data produk yang masuk sesuai aturan bisnis.',
                    points: [
                        'authorize() menggunakan hasRole() untuk memastikan hanya admin dan manajer produk yang dapat membuat produk baru',
                        'Rule lt:harga pada harga_modal memastikan margin selalu positif di level validasi',
                        'Rule lte:stok pada stok_minimum menjaga konsistensi: stok minimum tidak melebihi stok awal',
                        'messages() dan attributes() memberikan pesan error dalam Bahasa Indonesia yang user-friendly',
                        'failedValidation() di-override agar response selalu dalam format JSON konsisten untuk REST API'
                    ]
                },
                output: {
                    type: 'json',
                    meta: { status: 422, time: '18ms', rows: null },
                    data: {
                        success: false,
                        message: 'Data yang dikirim tidak valid.',
                        errors: {
                            nama_produk: ['Nama produk sudah terdaftar di sistem.'],
                            harga_modal: ['Harga modal harus lebih rendah dari harga jual.'],
                            satuan: ['Satuan harus salah satu: pcs, kg, liter, meter, lusin, kodi, karton.']
                        }
                    }
                }
            }
        ]
    },

    codeigniter: {
        label: 'CodeIgniter v4',
        color: 'bg-orange-400',
        scripts: [
            {
                id: 'ci-controller',
                label: 'RESTful Controller',
                filename: 'MahasiswaController.php',
                language: 'php',
                code: `<?php

namespace App\\Controllers\\Api;

use App\\Controllers\\BaseController;
use App\\Models\\MahasiswaModel;
use CodeIgniter\\API\\ResponseTrait;
use CodeIgniter\\HTTP\\ResponseInterface;

class MahasiswaController extends BaseController
{
    use ResponseTrait;

    protected MahasiswaModel $model;

    public function __construct()
    {
        $this->model = new MahasiswaModel();
    }

    public function index(): ResponseInterface
    {
        $filters = [
            'prodi'    => $this->request->getGet('prodi'),
            'angkatan' => $this->request->getGet('angkatan'),
            'status'   => $this->request->getGet('status') ?? 'aktif',
            'search'   => $this->request->getGet('q'),
        ];

        $perPage = (int) ($this->request->getGet('per_page') ?? 20);
        $result  = $this->model->getFiltered($filters, $perPage);

        return $this->respond([
            'status'  => 'success',
            'data'    => $result['data'],
            'pager'   => $result['pager'],
            'total'   => $result['total'],
        ]);
    }

    public function store(): ResponseInterface
    {
        $rules = [
            'nim'        => 'required|is_unique[mahasiswa.nim]|min_length[8]|max_length[12]',
            'nama'       => 'required|string|min_length[3]|max_length[100]',
            'email'      => 'required|valid_email|is_unique[mahasiswa.email]',
            'prodi_id'   => 'required|is_not_unique[program_studi.id]',
            'angkatan'   => 'required|integer|greater_than[2000]|less_than[2030]',
            'no_hp'      => 'permit_empty|regex_match[/^08[0-9]{8,11}$/]',
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $data = [
            'nim'      => $this->request->getPost('nim'),
            'nama'     => $this->request->getPost('nama'),
            'email'    => $this->request->getPost('email'),
            'prodi_id' => $this->request->getPost('prodi_id'),
            'angkatan' => $this->request->getPost('angkatan'),
            'no_hp'    => $this->request->getPost('no_hp'),
            'status'   => 'aktif',
        ];

        $id = $this->model->insert($data);

        if (!$id) {
            return $this->failServerError('Gagal menyimpan data mahasiswa.');
        }

        return $this->respondCreated([
            'status'  => 'success',
            'message' => 'Data mahasiswa berhasil ditambahkan.',
            'data'    => $this->model->find($id),
        ]);
    }

    public function show(int $id): ResponseInterface
    {
        $mahasiswa = $this->model->withDetail($id);

        if (!$mahasiswa) {
            return $this->failNotFound('Mahasiswa dengan ID ' . $id . ' tidak ditemukan.');
        }

        return $this->respond([
            'status' => 'success',
            'data'   => $mahasiswa,
        ]);
    }

    public function destroy(int $id): ResponseInterface
    {
        $mahasiswa = $this->model->find($id);

        if (!$mahasiswa) {
            return $this->failNotFound('Mahasiswa tidak ditemukan.');
        }

        if (!$this->model->delete($id)) {
            return $this->failServerError('Gagal menghapus data mahasiswa.');
        }

        return $this->respondDeleted([
            'status'  => 'success',
            'message' => 'Data mahasiswa berhasil dihapus.',
        ]);
    }
}`,
                explanation: {
                    title: 'CodeIgniter v4 - RESTful Controller',
                    overview: 'MahasiswaController memanfaatkan ResponseTrait bawaan CodeIgniter 4 untuk membangun REST API manajemen data mahasiswa sistem akademik Indonesia.',
                    points: [
                        'ResponseTrait menyediakan method respond(), respondCreated(), failNotFound(), failValidationErrors() yang mengikuti standar HTTP',
                        'Validasi inline di store() menggunakan built-in validation CI4 dengan rules yang bersih',
                        'Regex validation nomor HP: /^08[0-9]{8,11}$/ memvalidasi format nomor Indonesia',
                        'Model di-inject via constructor, mudah di-mock untuk unit testing',
                        'Setiap response menggunakan HTTP status code yang tepat sesuai standar REST'
                    ]
                },
                output: {
                    type: 'json',
                    meta: { status: 200, time: '35ms', rows: 20 },
                    data: {
                        status: 'success',
                        data: [
                            { id: 1, nim: '20230001', nama: 'Rizky Fadillah Putra', email: 'rizky.fadillah@student.ac.id', prodi: 'Teknik Informatika', angkatan: 2023, status: 'aktif' },
                            { id: 2, nim: '20230042', nama: 'Siti Nurhaliza Dewi', email: 'siti.nurhaliza@student.ac.id', prodi: 'Sistem Informasi', angkatan: 2023, status: 'aktif' },
                            { id: 3, nim: '20220018', nama: 'Budi Santoso Wibowo', email: 'budi.santoso@student.ac.id', prodi: 'Teknik Informatika', angkatan: 2022, status: 'aktif' }
                        ],
                        total: 487,
                        pager: { current_page: 1, per_page: 20, total_pages: 25 }
                    }
                }
            },
            {
                id: 'ci-model',
                label: 'Model Query Builder',
                filename: 'MahasiswaModel.php',
                language: 'php',
                code: `<?php

namespace App\\Models;

use CodeIgniter\\Model;

class MahasiswaModel extends Model
{
    protected $table            = 'mahasiswa';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = true;

    protected $allowedFields = [
        'nim', 'nama', 'email', 'prodi_id',
        'angkatan', 'no_hp', 'alamat', 'foto', 'status',
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules = [
        'nim'   => 'required|min_length[8]|max_length[12]',
        'nama'  => 'required|min_length[3]|max_length[100]',
        'email' => 'required|valid_email',
    ];

    public function getFiltered(array $filters, int $perPage = 20): array
    {
        $builder = $this->db->table('mahasiswa m')
            ->select('m.id, m.nim, m.nama, m.email, m.angkatan, m.status, m.no_hp, ps.nama_prodi as prodi')
            ->join('program_studi ps', 'ps.id = m.prodi_id')
            ->where('m.deleted_at', null);

        if (!empty($filters['prodi'])) {
            $builder->like('ps.nama_prodi', $filters['prodi']);
        }

        if (!empty($filters['angkatan'])) {
            $builder->where('m.angkatan', $filters['angkatan']);
        }

        if (!empty($filters['status'])) {
            $builder->where('m.status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $builder->groupStart()
                ->like('m.nama', $filters['search'])
                ->orLike('m.nim', $filters['search'])
                ->orLike('m.email', $filters['search'])
                ->groupEnd();
        }

        $total   = $builder->countAllResults(false);
        $offset  = ($this->request->getGet('page', FILTER_VALIDATE_INT) - 1) * $perPage;
        $data    = $builder->limit($perPage, max(0, $offset))->get()->getResultArray();

        return [
            'data'  => $data,
            'total' => $total,
            'pager' => [
                'current_page' => max(1, (int) ceil(($offset + 1) / $perPage)),
                'per_page'     => $perPage,
                'total_pages'  => (int) ceil($total / $perPage),
            ],
        ];
    }

    public function withDetail(int $id): array|null
    {
        return $this->db->table('mahasiswa m')
            ->select('m.*, ps.nama_prodi as prodi, ps.jenjang, f.nama_fakultas as fakultas')
            ->join('program_studi ps', 'ps.id = m.prodi_id')
            ->join('fakultas f', 'f.id = ps.fakultas_id')
            ->where('m.id', $id)
            ->where('m.deleted_at', null)
            ->get()
            ->getRowArray();
    }
}`,
                explanation: {
                    title: 'CodeIgniter v4 - Model Query Builder',
                    overview: 'MahasiswaModel menggabungkan fitur ORM CodeIgniter 4 dengan Query Builder untuk query yang lebih kompleks, mendukung filter dinamis dan eager JOIN.',
                    points: [
                        'useSoftDeletes melindungi data dari penghapusan permanen, konsisten dengan WHERE deleted_at IS NULL',
                        'getFiltered() membangun query secara kondisional, hanya menambahkan WHERE jika filter ada nilainya',
                        'groupStart() dan groupEnd() membungkus OR conditions untuk logika AND (filter) + OR (search)',
                        'countAllResults(false) menghitung total tanpa mereset builder, efisien untuk paginasi',
                        'withDetail() menggunakan multi JOIN untuk mengambil data dari 3 tabel dalam 1 query'
                    ]
                },
                output: {
                    type: 'json',
                    meta: { status: 200, time: '31ms', rows: 1 },
                    data: {
                        id: 1,
                        nim: '20230001',
                        nama: 'Rizky Fadillah Putra',
                        email: 'rizky.fadillah@student.ac.id',
                        angkatan: 2023,
                        no_hp: '081234567890',
                        prodi: 'Teknik Informatika',
                        jenjang: 'S1',
                        fakultas: 'Fakultas Ilmu Komputer',
                        status: 'aktif',
                        created_at: '2023-08-15 09:23:11',
                        updated_at: '2024-03-01 14:05:44'
                    }
                }
            },
            {
                id: 'ci-migration',
                label: 'DB Migration',
                filename: '2024-01-15-083000_CreateMahasiswaTable.php',
                language: 'php',
                code: `<?php

namespace App\\Database\\Migrations;

use CodeIgniter\\Database\\Migration;
use CodeIgniter\\Database\\RawSql;

class CreateMahasiswaTable extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'BIGINT',
                'constraint'     => 20,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'nim' => [
                'type'       => 'VARCHAR',
                'constraint' => 12,
                'unique'     => true,
            ],
            'nama' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
            ],
            'email' => [
                'type'       => 'VARCHAR',
                'constraint' => 150,
                'unique'     => true,
            ],
            'prodi_id' => [
                'type'     => 'BIGINT',
                'constraint' => 20,
                'unsigned' => true,
            ],
            'angkatan' => [
                'type'       => 'SMALLINT',
                'constraint' => 4,
                'unsigned'   => true,
            ],
            'no_hp' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true,
            ],
            'alamat' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'foto' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['aktif', 'cuti', 'lulus', 'dropout'],
                'default'    => 'aktif',
            ],
            'created_at' => [
                'type'    => 'DATETIME',
                'null'    => true,
                'default' => new RawSql('CURRENT_TIMESTAMP'),
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'deleted_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('prodi_id', 'program_studi', 'id', 'RESTRICT', 'CASCADE');
        $this->forge->addKey(['angkatan', 'status']);

        $this->forge->createTable('mahasiswa', true, [
            'ENGINE'  => 'InnoDB',
            'CHARSET' => 'utf8mb4',
        ]);
    }

    public function down(): void
    {
        $this->forge->dropTable('mahasiswa', true);
    }
}`,
                explanation: {
                    title: 'CodeIgniter v4 - Database Migration',
                    overview: 'Migration CreateMahasiswaTable mendefinisikan skema tabel mahasiswa menggunakan Forge API CodeIgniter 4 yang database-agnostic dan mudah di-rollback.',
                    points: [
                        'RawSql digunakan untuk CURRENT_TIMESTAMP agar tidak terikat dengan string literal database tertentu',
                        'ENUM untuk status membatasi nilai yang valid di level database, bukan hanya di aplikasi',
                        'addForeignKey() dengan RESTRICT ON DELETE menjaga integritas: mahasiswa tidak bisa dihapus jika prodi dihapus',
                        'Composite index pada (angkatan, status) mempercepat query filter yang paling sering digunakan',
                        'down() yang lengkap memastikan rollback berjalan bersih tanpa meninggalkan tabel orphan'
                    ]
                },
                output: {
                    type: 'json',
                    meta: { status: 200, time: '12ms', rows: null },
                    data: {
                        status: 'success',
                        message: 'Migration berhasil dijalankan.',
                        migration: '2024-01-15-083000_CreateMahasiswaTable',
                        tables_created: ['mahasiswa'],
                        indexes_created: ['PRIMARY', 'nim_unique', 'email_unique', 'angkatan_status_idx'],
                        foreign_keys: ['fk_mahasiswa_prodi_id'],
                        execution_time: '0.012s'
                    }
                }
            }
        ]
    },

    python: {
        label: 'Python + PostgreSQL',
        color: 'bg-blue-400',
        scripts: [
            {
                id: 'python-cleaning',
                label: 'Data Cleaning',
                filename: 'data_cleaning.py',
                language: 'python',
                code: `import pandas as pd
import numpy as np
from datetime import datetime

df = pd.read_csv('penjualan_toko_nusantara_2024.csv')

print(f"Shape awal: {df.shape}")
print(f"Missing values:\\n{df.isnull().sum()}")
print(f"Duplicate rows: {df.duplicated().sum()}")

df.columns = df.columns.str.lower().str.replace(' ', '_').str.strip()

df['tanggal_transaksi'] = pd.to_datetime(
    df['tanggal_transaksi'], format='%d/%m/%Y', errors='coerce'
)

df['total_penjualan'] = (
    df['total_penjualan']
    .astype(str)
    .str.replace(r'[^0-9.]', '', regex=True)
    .str.strip()
    .replace('', np.nan)
    .astype(float)
)

df['nama_produk'] = df['nama_produk'].str.strip().str.title()
df['kategori']    = df['kategori'].str.strip().str.upper()
df['kota_tujuan'] = df['kota_tujuan'].str.strip().str.title()

df.drop_duplicates(subset=['id_transaksi'], keep='first', inplace=True)

df.dropna(subset=['tanggal_transaksi', 'total_penjualan', 'id_transaksi'], inplace=True)

q1 = df['total_penjualan'].quantile(0.25)
q3 = df['total_penjualan'].quantile(0.75)
iqr = q3 - q1
lower_bound = q1 - 1.5 * iqr
upper_bound = q3 + 1.5 * iqr

outlier_mask = (df['total_penjualan'] < lower_bound) | (df['total_penjualan'] > upper_bound)
outlier_count = outlier_mask.sum()
df = df[~outlier_mask].copy()

df['bulan']  = df['tanggal_transaksi'].dt.month
df['kuartal'] = df['tanggal_transaksi'].dt.quarter
df['tahun']  = df['tanggal_transaksi'].dt.year

df['segmen_nilai'] = pd.cut(
    df['total_penjualan'],
    bins=[0, 100_000, 500_000, 1_000_000, float('inf')],
    labels=['Kecil', 'Menengah', 'Besar', 'Premium']
)

print(f"\\nShape setelah cleaning: {df.shape}")
print(f"Outlier dihapus: {outlier_count}")
print(f"Distribusi segmen:\\n{df['segmen_nilai'].value_counts()}")

df.to_csv('penjualan_clean_2024.csv', index=False, encoding='utf-8-sig')
print("\\nData bersih tersimpan ke penjualan_clean_2024.csv")`,
                explanation: {
                    title: 'Python - Data Cleaning Pipeline',
                    overview: 'Script pembersihan data penjualan Toko Nusantara 2024 menggunakan Pandas, menangani format tidak konsisten, duplikat, missing values, dan outlier statistik.',
                    points: [
                        'Normalisasi nama kolom ke snake_case memastikan konsistensi akses di seluruh pipeline',
                        'IQR method untuk deteksi outlier lebih robust dibanding z-score untuk distribusi tidak normal',
                        'pd.cut() dengan bins manual menciptakan segmentasi nilai transaksi yang sesuai konteks bisnis',
                        'errors=coerce pada to_datetime mengubah format tidak valid menjadi NaN, bukan raise error',
                        'utf-8-sig encoding untuk CSV memastikan karakter Indonesia tampil benar di Excel'
                    ]
                },
                output: {
                    type: 'table',
                    meta: { rows: 8, time: '1.24s' },
                    headers: ['id_transaksi', 'tanggal_transaksi', 'nama_produk', 'kategori', 'total_penjualan', 'kota_tujuan', 'kuartal', 'segmen_nilai'],
                    rows: [
                        ['TRX-2024-0001', '2024-01-05', 'Batik Tulis Jogja', 'PAKAIAN', '485000', 'Surabaya', 'Q1', 'Menengah'],
                        ['TRX-2024-0002', '2024-01-07', 'Kopi Arabika Gayo', 'MINUMAN', '125000', 'Jakarta', 'Q1', 'Kecil'],
                        ['TRX-2024-0019', '2024-01-15', 'Tenun Ikat NTT', 'KERAJINAN', '750000', 'Bandung', 'Q1', 'Besar'],
                        ['TRX-2024-0031', '2024-02-02', 'Rendang Kemasan', 'MAKANAN', '95000', 'Medan', 'Q1', 'Kecil'],
                        ['TRX-2024-0047', '2024-02-14', 'Tas Kulit Garut', 'AKSESORI', '1250000', 'Bali', 'Q1', 'Premium'],
                        ['TRX-2024-0052', '2024-03-01', 'Sarung Samarinda', 'PAKAIAN', '320000', 'Makassar', 'Q1', 'Menengah'],
                        ['TRX-2024-0068', '2024-03-18', 'Madu Hutan Sumbawa', 'KESEHATAN', '210000', 'Yogyakarta', 'Q1', 'Menengah'],
                        ['TRX-2024-0079', '2024-03-29', 'Gerabah Lombok', 'KERAJINAN', '580000', 'Semarang', 'Q1', 'Besar'],
                    ],
                    chart: {
                        type: 'bar',
                        label: 'Total Penjualan per Kuartal (Rp)',
                        labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
                        data: [148500000, 192300000, 176800000, 221400000],
                        color: '#60a5fa'
                    }
                }
            },
            {
                id: 'python-query',
                label: 'PostgreSQL Query',
                filename: 'analisis_penjualan.py',
                language: 'python',
                code: `import psycopg2
import pandas as pd
from contextlib import contextmanager

DB_CONFIG = {
    'host'     : 'localhost',
    'port'     : 5432,
    'database' : 'toko_nusantara',
    'user'     : 'bagas',
    'password' : 'secret',
}

@contextmanager
def get_connection():
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        yield conn
    finally:
        conn.close()

def analisis_produk_terlaris(tahun: int = 2024, top_n: int = 10) -> pd.DataFrame:
    query = """
        SELECT
            p.nama_produk,
            k.nama_kategori,
            COUNT(oi.id)              AS total_transaksi,
            SUM(oi.qty)               AS total_qty,
            SUM(oi.subtotal)          AS total_revenue,
            AVG(oi.harga_satuan)      AS avg_harga,
            ROUND(
                SUM(oi.subtotal) * 100.0 /
                SUM(SUM(oi.subtotal)) OVER (), 2
            )                         AS persen_revenue
        FROM order_items oi
        JOIN produk p       ON p.id = oi.produk_id
        JOIN kategori k     ON k.id = p.kategori_id
        JOIN orders o       ON o.id = oi.order_id
        WHERE
            EXTRACT(YEAR FROM o.tanggal_order) = %(tahun)s
            AND o.status = 'selesai'
        GROUP BY p.id, p.nama_produk, k.nama_kategori
        ORDER BY total_revenue DESC
        LIMIT %(top_n)s
    """
    with get_connection() as conn:
        df = pd.read_sql_query(query, conn, params={'tahun': tahun, 'top_n': top_n})

    df['total_revenue'] = df['total_revenue'].apply(lambda x: f"Rp {x:,.0f}")
    df['avg_harga']     = df['avg_harga'].apply(lambda x: f"Rp {x:,.0f}")
    df['persen_revenue'] = df['persen_revenue'].apply(lambda x: f"{x}%")

    return df

def ringkasan_bulanan(tahun: int = 2024) -> pd.DataFrame:
    query = """
        SELECT
            TO_CHAR(o.tanggal_order, 'Month') AS bulan,
            EXTRACT(MONTH FROM o.tanggal_order)::INT AS bulan_num,
            COUNT(DISTINCT o.id)    AS total_order,
            COUNT(DISTINCT o.pelanggan_id) AS pelanggan_unik,
            SUM(o.total_bayar)      AS total_revenue,
            AVG(o.total_bayar)      AS avg_order_value,
            COUNT(DISTINCT CASE WHEN o.is_repeat_buyer THEN o.pelanggan_id END) AS repeat_buyers
        FROM orders o
        WHERE
            EXTRACT(YEAR FROM o.tanggal_order) = %(tahun)s
            AND o.status = 'selesai'
        GROUP BY bulan, bulan_num
        ORDER BY bulan_num
    """
    with get_connection() as conn:
        return pd.read_sql_query(query, conn, params={'tahun': tahun})

if __name__ == '__main__':
    print("=== Top 10 Produk Terlaris 2024 ===")
    df_produk = analisis_produk_terlaris(2024, 10)
    print(df_produk.to_string(index=False))

    print("\\n=== Ringkasan Penjualan Bulanan 2024 ===")
    df_bulanan = ringkasan_bulanan(2024)
    print(df_bulanan.to_string(index=False))`,
                explanation: {
                    title: 'Python - PostgreSQL Query & Analisis',
                    overview: 'Script analisis penjualan Toko Nusantara menggunakan psycopg2 dan Pandas untuk query PostgreSQL, menghitung produk terlaris dan ringkasan bulanan.',
                    points: [
                        'Context manager get_connection() memastikan koneksi selalu ditutup meski terjadi exception',
                        'Window function SUM() OVER () menghitung persentase revenue tanpa subquery tambahan',
                        'Parameterized query %(tahun)s mencegah SQL injection dan aman untuk input dinamis',
                        'pd.read_sql_query() langsung mengubah result set menjadi DataFrame tanpa loop manual',
                        'TO_CHAR dan EXTRACT digunakan untuk manipulasi tanggal di sisi database, lebih efisien dari Python'
                    ]
                },
                output: {
                    type: 'table',
                    meta: { rows: 5, time: '0.89s' },
                    headers: ['nama_produk', 'nama_kategori', 'total_transaksi', 'total_qty', 'total_revenue', 'persen_revenue'],
                    rows: [
                        ['Batik Tulis Premium Jogja', 'Pakaian', '842', '1.284', 'Rp 622.140.000', '18.2%'],
                        ['Tas Kulit Garut Handmade', 'Aksesori', '631', '631', 'Rp 789.375.000', '23.1%'],
                        ['Kopi Arabika Gayo 500gr', 'Minuman', '1.205', '2.410', 'Rp 150.625.000', '4.4%'],
                        ['Tenun Ikat NTT Asli', 'Kerajinan', '389', '432', 'Rp 324.000.000', '9.5%'],
                        ['Madu Hutan Sumbawa 1kg', 'Kesehatan', '754', '1.508', 'Rp 226.200.000', '6.6%'],
                    ],
                    chart: {
                        type: 'bar',
                        label: 'Revenue per Produk (Rp Juta)',
                        labels: ['Batik Tulis', 'Tas Kulit', 'Kopi Gayo', 'Tenun NTT', 'Madu Sumbawa'],
                        data: [622, 789, 151, 324, 226],
                        color: '#60a5fa'
                    }
                }
            },
            {
                id: 'python-stats',
                label: 'Statistical Analysis',
                filename: 'statistik_penjualan.py',
                language: 'python',
                code: `import pandas as pd
import numpy as np
from scipy import stats

df = pd.read_csv('penjualan_clean_2024.csv', parse_dates=['tanggal_transaksi'])

desc = df['total_penjualan'].describe()
print("=== Statistik Deskriptif Total Penjualan ===")
print(f"Mean   : Rp {desc['mean']:>15,.0f}")
print(f"Median : Rp {df['total_penjualan'].median():>15,.0f}")
print(f"Std Dev: Rp {desc['std']:>15,.0f}")
print(f"Min    : Rp {desc['min']:>15,.0f}")
print(f"Max    : Rp {desc['max']:>15,.0f}")
print(f"Skewness : {df['total_penjualan'].skew():.4f}")
print(f"Kurtosis : {df['total_penjualan'].kurt():.4f}")

bulanan = df.groupby('bulan')['total_penjualan'].sum()
growth  = bulanan.pct_change() * 100
print("\\n=== Month-over-Month Growth ===")
for bulan, val in growth.dropna().items():
    arrow = "+" if val > 0 else ""
    print(f"Bulan {bulan:02d}: {arrow}{val:.1f}%")

kategori_revenue = df.groupby('kategori')['total_penjualan'].agg(['sum', 'count', 'mean'])
kategori_revenue.columns = ['total_revenue', 'jumlah_transaksi', 'avg_transaksi']
kategori_revenue = kategori_revenue.sort_values('total_revenue', ascending=False)

print("\\n=== Revenue per Kategori ===")
print(kategori_revenue.to_string())

pakaian = df[df['kategori'] == 'PAKAIAN']['total_penjualan']
kerajinan = df[df['kategori'] == 'KERAJINAN']['total_penjualan']
t_stat, p_value = stats.ttest_ind(pakaian, kerajinan)
print(f"\\n=== T-Test: Pakaian vs Kerajinan ===")
print(f"t-statistic : {t_stat:.4f}")
print(f"p-value     : {p_value:.4f}")
print(f"Kesimpulan  : {'Signifikan berbeda' if p_value < 0.05 else 'Tidak signifikan'} (alpha=0.05)")

kota_top = df.groupby('kota_tujuan')['total_penjualan'].sum().nlargest(5)
print("\\n=== Top 5 Kota Tujuan Pengiriman ===")
for kota, revenue in kota_top.items():
    print(f"{kota:<15}: Rp {revenue:>15,.0f}")`,
                explanation: {
                    title: 'Python - Statistical Analysis',
                    overview: 'Analisis statistik mendalam data penjualan Toko Nusantara menggunakan Pandas dan SciPy, mencakup deskriptif, growth analysis, dan hypothesis testing.',
                    points: [
                        'Skewness positif mengindikasikan distribusi penjualan condong ke nilai kecil, ada sedikit transaksi bernilai sangat besar',
                        'pct_change() Pandas menghitung Month-over-Month growth otomatis tanpa loop manual',
                        'T-test independen dari SciPy membandingkan apakah rata-rata penjualan antar kategori berbeda secara statistik',
                        'nlargest(5) efisien untuk ranking tanpa perlu sort seluruh DataFrame',
                        'groupby dengan agg list memungkinkan kalkulasi multiple aggregation dalam satu pass'
                    ]
                },
                output: {
                    type: 'table',
                    meta: { rows: 5, time: '0.67s' },
                    headers: ['kategori', 'total_revenue', 'jumlah_transaksi', 'avg_transaksi', 'persen_total'],
                    rows: [
                        ['PAKAIAN', 'Rp 1.245.800.000', '2.841', 'Rp 438.507', '36.4%'],
                        ['AKSESORI', 'Rp 892.300.000', '1.203', 'Rp 741.729', '26.1%'],
                        ['KERAJINAN', 'Rp 624.500.000', '1.587', 'Rp 393.511', '18.2%'],
                        ['MAKANAN', 'Rp 341.200.000', '3.241', 'Rp 105.245', '10.0%'],
                        ['KESEHATAN', 'Rp 318.700.000', '1.094', 'Rp 291.344', '9.3%'],
                    ],
                    chart: {
                        type: 'bar',
                        label: 'Revenue per Kategori (Rp Juta)',
                        labels: ['Pakaian', 'Aksesori', 'Kerajinan', 'Makanan', 'Kesehatan'],
                        data: [1246, 892, 625, 341, 319],
                        color: '#60a5fa'
                    }
                }
            }
        ]
    },

    mysql: {
        label: 'MySQL',
        color: 'bg-yellow-400',
        scripts: [
            {
                id: 'mysql-schema',
                label: 'Schema Design',
                filename: 'schema_inventori.sql',
                language: 'sql',
                code: `CREATE DATABASE IF NOT EXISTS db_inventori_gudang
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE db_inventori_gudang;

CREATE TABLE IF NOT EXISTS kategori_barang (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode        VARCHAR(10)  NOT NULL UNIQUE,
    nama        VARCHAR(100) NOT NULL,
    deskripsi   TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS supplier (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode        VARCHAR(15)  NOT NULL UNIQUE,
    nama        VARCHAR(150) NOT NULL,
    kontak      VARCHAR(100),
    telepon     VARCHAR(20),
    email       VARCHAR(150),
    kota        VARCHAR(100),
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS barang (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode_barang     VARCHAR(20)  NOT NULL UNIQUE,
    nama_barang     VARCHAR(200) NOT NULL,
    kategori_id     BIGINT UNSIGNED NOT NULL,
    supplier_id     BIGINT UNSIGNED,
    satuan          ENUM('pcs','kg','liter','meter','karton','lusin','set') NOT NULL DEFAULT 'pcs',
    harga_beli      DECIMAL(15,2) DEFAULT 0,
    harga_jual      DECIMAL(15,2) DEFAULT 0,
    stok_sekarang   INT DEFAULT 0,
    stok_minimum    INT DEFAULT 5,
    stok_maksimum   INT DEFAULT 1000,
    lokasi_rak      VARCHAR(20),
    is_active       TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_barang_kategori FOREIGN KEY (kategori_id)
        REFERENCES kategori_barang(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_barang_supplier FOREIGN KEY (supplier_id)
        REFERENCES supplier(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_kategori (kategori_id),
    INDEX idx_stok_minimum (stok_sekarang, stok_minimum),
    INDEX idx_aktif (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transaksi_stok (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barang_id       BIGINT UNSIGNED NOT NULL,
    tipe            ENUM('masuk','keluar','penyesuaian','retur') NOT NULL,
    qty             INT NOT NULL,
    stok_sebelum    INT NOT NULL,
    stok_sesudah    INT NOT NULL,
    referensi       VARCHAR(50),
    keterangan      TEXT,
    user_id         BIGINT UNSIGNED,
    tanggal         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaksi_barang FOREIGN KEY (barang_id)
        REFERENCES barang(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_barang_tanggal (barang_id, tanggal),
    INDEX idx_tipe (tipe),
    INDEX idx_referensi (referensi)
) ENGINE=InnoDB;

DELIMITER $$

CREATE TRIGGER trg_update_stok_after_transaksi
AFTER INSERT ON transaksi_stok
FOR EACH ROW
BEGIN
    UPDATE barang
    SET stok_sekarang = NEW.stok_sesudah,
        updated_at    = NOW()
    WHERE id = NEW.barang_id;
END$$

DELIMITER ;`,
                explanation: {
                    title: 'MySQL - Database Schema Design',
                    overview: 'Desain skema database inventori gudang dengan 4 tabel utama, foreign key constraints, indexing strategy, dan trigger otomatis untuk sinkronisasi stok.',
                    points: [
                        'utf8mb4_unicode_ci mendukung emoji dan karakter Unicode penuh, penting untuk nama produk Indonesia',
                        'DECIMAL(15,2) untuk harga menghindari floating point error yang umum terjadi di tipe FLOAT/DOUBLE',
                        'Composite index (stok_sekarang, stok_minimum) mempercepat query deteksi barang dengan stok menipis',
                        'TRIGGER AFTER INSERT otomatis menjaga sinkronisasi stok tanpa logika duplikat di aplikasi',
                        'ON DELETE SET NULL pada supplier_id mempertahankan data barang meski supplier dihapus'
                    ]
                },
                output: {
                    type: 'table',
                    meta: { rows: 4, time: '0.031s' },
                    headers: ['table_name', 'engine', 'charset', 'rows_estimate', 'index_count'],
                    rows: [
                        ['kategori_barang', 'InnoDB', 'utf8mb4', '12', '1'],
                        ['supplier', 'InnoDB', 'utf8mb4', '28', '2'],
                        ['barang', 'InnoDB', 'utf8mb4', '1.842', '5'],
                        ['transaksi_stok', 'InnoDB', 'utf8mb4', '48.291', '4'],
                    ]
                }
            },
            {
                id: 'mysql-join',
                label: 'JOIN Query',
                filename: 'laporan_inventori.sql',
                language: 'sql',
                code: `SELECT
    b.kode_barang,
    b.nama_barang,
    kb.nama                             AS kategori,
    s.nama                              AS supplier,
    b.satuan,
    b.stok_sekarang,
    b.stok_minimum,
    b.stok_maksimum,
    CASE
        WHEN b.stok_sekarang = 0                       THEN 'HABIS'
        WHEN b.stok_sekarang <= b.stok_minimum         THEN 'MENIPIS'
        WHEN b.stok_sekarang >= b.stok_maksimum * 0.9  THEN 'PENUH'
        ELSE 'NORMAL'
    END                                 AS status_stok,
    FORMAT(b.harga_beli, 0, 'id_ID')   AS harga_beli,
    FORMAT(b.harga_jual, 0, 'id_ID')   AS harga_jual,
    FORMAT(
        (b.harga_jual - b.harga_beli) / b.harga_beli * 100, 1
    )                                   AS margin_persen,
    FORMAT(
        b.stok_sekarang * b.harga_beli, 0, 'id_ID'
    )                                   AS nilai_stok,
    ts_last.tanggal                     AS transaksi_terakhir,
    ts_last.tipe                        AS tipe_terakhir,
    COUNT(ts.id)                        AS total_transaksi_30hari
FROM barang b
JOIN kategori_barang kb
    ON kb.id = b.kategori_id
LEFT JOIN supplier s
    ON s.id = b.supplier_id
LEFT JOIN transaksi_stok ts
    ON ts.barang_id = b.id
    AND ts.tanggal >= DATE_SUB(NOW(), INTERVAL 30 DAY)
LEFT JOIN LATERAL (
    SELECT tanggal, tipe
    FROM transaksi_stok
    WHERE barang_id = b.id
    ORDER BY tanggal DESC
    LIMIT 1
) ts_last ON TRUE
WHERE
    b.is_active = 1
    AND b.stok_sekarang <= b.stok_minimum
GROUP BY
    b.id, b.kode_barang, b.nama_barang,
    kb.nama, s.nama, b.satuan,
    b.stok_sekarang, b.stok_minimum, b.stok_maksimum,
    b.harga_beli, b.harga_jual,
    ts_last.tanggal, ts_last.tipe
ORDER BY
    b.stok_sekarang ASC,
    nilai_stok DESC
LIMIT 20;`,
                explanation: {
                    title: 'MySQL - Complex JOIN Query',
                    overview: 'Query laporan inventori menggabungkan 4 tabel dengan CASE expression, LATERAL subquery, dan agregasi untuk menghasilkan laporan stok menipis yang komprehensif.',
                    points: [
                        'LATERAL JOIN (MySQL 8.0+) mengambil transaksi terakhir per barang secara efisien tanpa correlated subquery ganda',
                        'CASE expression mengkategorikan status stok langsung di query, tidak perlu post-processing di aplikasi',
                        'FORMAT(nilai, 0, id_ID) memformat angka dengan pemisah ribuan sesuai locale Indonesia',
                        'COUNT pada transaksi 30 hari terakhir dengan filter DATE_SUB memberikan indikator aktivitas barang',
                        'LEFT JOIN ke supplier mempertahankan barang yang supplier-nya null (sudah dihapus)'
                    ]
                },
                output: {
                    type: 'table',
                    meta: { rows: 5, time: '0.048s' },
                    headers: ['kode_barang', 'nama_barang', 'kategori', 'stok_sekarang', 'stok_minimum', 'status_stok', 'nilai_stok', 'transaksi_terakhir'],
                    rows: [
                        ['BRG-001-A', 'Bearing SKF 6205', 'Spare Part', '0', '10', 'HABIS', 'Rp 0', '2024-11-28'],
                        ['BRG-002-B', 'Oli Mesin Pertamina 20L', 'Consumable', '3', '15', 'MENIPIS', 'Rp 765.000', '2024-12-01'],
                        ['BRG-003-C', 'Karet Seal Hydraulic', 'Spare Part', '5', '20', 'MENIPIS', 'Rp 375.000', '2024-11-30'],
                        ['BRG-004-D', 'Baut M12 x 50 (box)', 'Fastener', '8', '50', 'MENIPIS', 'Rp 720.000', '2024-12-02'],
                        ['BRG-005-E', 'Filter Udara Kompresor', 'Filter', '2', '8', 'MENIPIS', 'Rp 590.000', '2024-11-25'],
                    ]
                }
            },
            {
                id: 'mysql-procedure',
                label: 'Stored Procedure',
                filename: 'procedure_stok.sql',
                language: 'sql',
                code: `DELIMITER $$

CREATE PROCEDURE sp_transaksi_stok (
    IN  p_barang_id     BIGINT UNSIGNED,
    IN  p_tipe          ENUM('masuk','keluar','penyesuaian','retur'),
    IN  p_qty           INT,
    IN  p_referensi     VARCHAR(50),
    IN  p_keterangan    TEXT,
    IN  p_user_id       BIGINT UNSIGNED,
    OUT p_success       TINYINT,
    OUT p_message       VARCHAR(255),
    OUT p_stok_sesudah  INT
)
BEGIN
    DECLARE v_stok_sekarang INT DEFAULT 0;
    DECLARE v_stok_minimum  INT DEFAULT 0;
    DECLARE v_nama_barang   VARCHAR(200);
    DECLARE v_stok_baru     INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = 0;
        SET p_message = 'Terjadi kesalahan sistem. Transaksi dibatalkan.';
        SET p_stok_sesudah = -1;
    END;

    START TRANSACTION;

    SELECT stok_sekarang, stok_minimum, nama_barang
    INTO   v_stok_sekarang, v_stok_minimum, v_nama_barang
    FROM   barang
    WHERE  id = p_barang_id AND is_active = 1
    FOR UPDATE;

    IF v_nama_barang IS NULL THEN
        ROLLBACK;
        SET p_success = 0;
        SET p_message = CONCAT('Barang ID ', p_barang_id, ' tidak ditemukan atau tidak aktif.');
        SET p_stok_sesudah = -1;
        LEAVE sp_transaksi_stok;
    END IF;

    IF p_qty <= 0 THEN
        ROLLBACK;
        SET p_success = 0;
        SET p_message = 'Jumlah transaksi harus lebih dari 0.';
        SET p_stok_sesudah = -1;
        LEAVE sp_transaksi_stok;
    END IF;

    SET v_stok_baru = CASE p_tipe
        WHEN 'masuk'        THEN v_stok_sekarang + p_qty
        WHEN 'keluar'       THEN v_stok_sekarang - p_qty
        WHEN 'retur'        THEN v_stok_sekarang + p_qty
        WHEN 'penyesuaian'  THEN p_qty
        ELSE v_stok_sekarang
    END;

    IF v_stok_baru < 0 THEN
        ROLLBACK;
        SET p_success = 0;
        SET p_message = CONCAT('Stok tidak mencukupi. Stok saat ini: ', v_stok_sekarang, ' ', p_tipe, ' ', p_qty);
        SET p_stok_sesudah = v_stok_sekarang;
        LEAVE sp_transaksi_stok;
    END IF;

    INSERT INTO transaksi_stok (
        barang_id, tipe, qty, stok_sebelum, stok_sesudah,
        referensi, keterangan, user_id
    ) VALUES (
        p_barang_id, p_tipe, p_qty, v_stok_sekarang, v_stok_baru,
        p_referensi, p_keterangan, p_user_id
    );

    COMMIT;

    SET p_success      = 1;
    SET p_stok_sesudah = v_stok_baru;
    SET p_message = CONCAT(
        'Transaksi berhasil. ', v_nama_barang,
        IF(v_stok_baru <= v_stok_minimum,
            CONCAT(' [PERINGATAN: Stok menipis, sisa ', v_stok_baru, ']'),
            ''
        )
    );
END$$

DELIMITER ;`,
                explanation: {
                    title: 'MySQL - Stored Procedure',
                    overview: 'Stored procedure sp_transaksi_stok mengenkapsulasi logika bisnis transaksi stok gudang dengan transaction control, validasi, dan error handling yang robust.',
                    points: [
                        'FOR UPDATE pada SELECT mengunci baris barang selama transaksi, mencegah race condition jika ada request bersamaan',
                        'EXIT HANDLER menangkap semua SQL exception dan melakukan ROLLBACK otomatis untuk menjaga konsistensi data',
                        'LEAVE sp_transaksi_stok keluar dari procedure lebih awal tanpa menjalankan sisa blok, mirip return di bahasa lain',
                        'CASE expression menghitung stok baru per tipe transaksi dalam satu ekspresi yang bersih',
                        'Pesan output dinamis dengan CONCAT memberikan feedback informatif termasuk peringatan stok menipis'
                    ]
                },
                output: {
                    type: 'table',
                    meta: { rows: 3, time: '0.021s' },
                    headers: ['call', 'p_success', 'p_message', 'p_stok_sesudah'],
                    rows: [
                        ['CALL sp_transaksi_stok(2, masuk, 50, PO-2024-112, ...)', '1', 'Transaksi berhasil. Oli Mesin Pertamina 20L', '53'],
                        ['CALL sp_transaksi_stok(1, keluar, 5, SO-2024-891, ...)', '1', 'Transaksi berhasil. Bearing SKF 6205 [PERINGATAN: Stok menipis, sisa 2]', '2'],
                        ['CALL sp_transaksi_stok(3, keluar, 999, SO-2024-892, ...)', '0', 'Stok tidak mencukupi. Stok saat ini: 5 keluar 999', '5'],
                    ]
                }
            }
        ]
    },

    cicd: {
        label: 'CI/CD Pipeline',
        color: 'bg-green-400',
        scripts: [
            {
                id: 'cicd-deploy',
                label: 'deploy.yml',
                filename: '.github/workflows/deploy.yml',
                language: 'yaml',
                code: `name: Deploy to VPS via SSH

on:
    push:
        branches: [main]
    workflow_dispatch:
        inputs:
            environment:
                description: Target environment
                required: true
                default: production
                type: choice
                options: [production, staging]

env:
    PHP_VERSION: '8.3'
    NODE_VERSION: '20'
    APP_DIR: /var/www/toko-nusantara

jobs:
    test:
        name: Run Tests
        runs-on: ubuntu-latest

        services:
            mysql:
                image: mysql:8.0
                env:
                    MYSQL_ROOT_PASSWORD: secret
                    MYSQL_DATABASE: toko_nusantara_test
                ports:
                    - 3306:3306
                options: >-
                    --health-cmd="mysqladmin ping"
                    --health-interval=10s
                    --health-timeout=5s
                    --health-retries=3

        steps:
            - name: Checkout repository
              uses: actions/checkout@v4

            - name: Setup PHP \${{ env.PHP_VERSION }}
              uses: shivammathur/setup-php@v2
              with:
                  php-version: \${{ env.PHP_VERSION }}
                  extensions: mbstring, bcmath, pdo_mysql, redis
                  coverage: xdebug

            - name: Cache Composer dependencies
              uses: actions/cache@v4
              with:
                  path: vendor
                  key: composer-\${{ hashFiles('composer.lock') }}
                  restore-keys: composer-

            - name: Install Composer dependencies
              run: composer install --prefer-dist --no-progress --no-interaction

            - name: Copy .env.testing
              run: cp .env.testing.example .env.testing

            - name: Generate app key
              run: php artisan key:generate --env=testing

            - name: Run database migrations
              run: php artisan migrate --env=testing --force

            - name: Run PHPUnit tests
              run: php artisan test --env=testing --coverage-min=80

    build:
        name: Build Assets
        runs-on: ubuntu-latest
        needs: test

        steps:
            - name: Checkout repository
              uses: actions/checkout@v4

            - name: Setup Node.js \${{ env.NODE_VERSION }}
              uses: actions/setup-node@v4
              with:
                  node-version: \${{ env.NODE_VERSION }}
                  cache: npm

            - name: Install Node dependencies
              run: npm ci

            - name: Build production assets
              run: npm run build

            - name: Upload build artifacts
              uses: actions/upload-artifact@v4
              with:
                  name: build-assets
                  path: public/build
                  retention-days: 1

    deploy:
        name: Deploy to VPS
        runs-on: ubuntu-latest
        needs: [test, build]
        environment: production

        steps:
            - name: Checkout repository
              uses: actions/checkout@v4

            - name: Download build artifacts
              uses: actions/download-artifact@v4
              with:
                  name: build-assets
                  path: public/build

            - name: Deploy via SSH
              uses: appleboy/ssh-action@v1
              with:
                  host: \${{ secrets.VPS_HOST }}
                  username: \${{ secrets.VPS_USER }}
                  key: \${{ secrets.VPS_SSH_KEY }}
                  port: \${{ secrets.VPS_PORT }}
                  script: |
                      set -e
                      cd \${{ env.APP_DIR }}

                      echo "[1/7] Pulling latest code..."
                      git pull origin main

                      echo "[2/7] Installing PHP dependencies..."
                      composer install --prefer-dist --no-dev --optimize-autoloader --no-interaction

                      echo "[3/7] Syncing build assets..."
                      rsync -av --delete public/build/ \${{ env.APP_DIR }}/public/build/

                      echo "[4/7] Running database migrations..."
                      php artisan migrate --force

                      echo "[5/7] Clearing and caching config..."
                      php artisan optimize:clear
                      php artisan optimize
                      php artisan view:cache

                      echo "[6/7] Restarting queue workers..."
                      php artisan queue:restart

                      echo "[7/7] Reloading PHP-FPM..."
                      sudo systemctl reload php8.3-fpm

                      echo "Deployment selesai!"

            - name: Notify deployment status
              if: always()
              uses: 8398a7/action-slack@v3
              with:
                  status: \${{ job.status }}
                  text: "Deploy Toko Nusantara ke production: \${{ job.status }}"
              env:
                  SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK }}`,
                explanation: {
                    title: 'GitHub Actions - CI/CD Pipeline',
                    overview: 'Pipeline deploy.yml otomatis menjalankan test, build aset, dan deploy ke VPS via SSH setiap push ke branch main, dengan MySQL service container untuk integration testing.',
                    points: [
                        'Jobs test, build, deploy berjalan berurutan dengan needs dependency, deploy hanya jalan jika test dan build berhasil',
                        'MySQL service container di job test menyediakan database nyata untuk integration test tanpa mock',
                        'Composer cache dengan hashFiles(composer.lock) memastikan cache invalidated hanya jika dependencies berubah',
                        'set -e di SSH script menghentikan seluruh proses jika ada satu command gagal, mencegah partial deployment',
                        'artisan optimize:clear lalu optimize memastikan config, route, dan event cache diperbarui setelah deploy'
                    ]
                },
                output: {
                    type: 'pipeline',
                    steps: [
                        { id: 1, name: 'Checkout repository', job: 'test', duration: '2s' },
                        { id: 2, name: 'Setup PHP 8.3 + extensions', job: 'test', duration: '18s' },
                        { id: 3, name: 'Cache Composer dependencies', job: 'test', duration: '3s' },
                        { id: 4, name: 'Install Composer dependencies', job: 'test', duration: '24s' },
                        { id: 5, name: 'Run database migrations', job: 'test', duration: '4s' },
                        { id: 6, name: 'Run PHPUnit tests (coverage 84%)', job: 'test', duration: '31s' },
                        { id: 7, name: 'Setup Node.js 20 + npm ci', job: 'build', duration: '22s' },
                        { id: 8, name: 'Build production assets (Vite)', job: 'build', duration: '18s' },
                        { id: 9, name: 'Upload build artifacts', job: 'build', duration: '5s' },
                        { id: 10, name: 'Deploy via SSH to VPS', job: 'deploy', duration: '47s' },
                        { id: 11, name: 'Notify Slack', job: 'deploy', duration: '2s' },
                    ],
                    total_duration: '176s',
                    status: 'success'
                }
            }
        ]
    }
};