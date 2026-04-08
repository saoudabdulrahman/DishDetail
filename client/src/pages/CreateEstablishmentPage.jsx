import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { api } from '../api';
import { useAuth } from '../auth/useAuth';
import { usePageTitle } from '../utils/usePageTitle';
import { createEstablishmentSchema } from '../validation/forms';

export default function CreateEstablishmentPage() {
  usePageTitle(
    'Add a Restaurant',
    'Create a new restaurant listing on DishDetail and manage your establishment profile.',
  );
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();

  const [restaurantName, setRestaurantName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.ownedEstablishment) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSubmitting) return;

    const parsed = createEstablishmentSchema.safeParse({
      restaurantName,
      cuisine,
      description,
      address,
      hours,
      phone,
      website,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...parsed.data,
        cuisine: parsed.data.cuisine
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      };

      if (imageFile) {
        const res = await api().uploadImage(imageFile);
        payload.restaurantImage = res.url;
      }

      const { establishment, token } = await api().createEstablishment(payload);

      // Update local auth state and token
      if (token) {
        await refreshAuth(token);
      }

      toast.success('Restaurant created successfully!');
      navigate(`/establishments/${establishment.slug}`);
    } catch (err) {
      setError(err.message || 'Failed to create establishment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.ownedEstablishment) return null;

  return (
    <main className="px-fluid-container mx-auto max-w-3xl pt-24 pb-20">
      <div className="bg-surface-container rounded-2xl p-6 sm:p-8">
        <div className="mb-8">
          <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
            Own a restaurant?
          </span>
          <h1 className="font-headline text-on-surface text-fluid-3xl mt-1 font-black tracking-tight">
            Add Your Restaurant
          </h1>
          <p className="text-on-surface-variant font-ui mt-2 text-sm">
            Create a listing to connect with food lovers and manage your
            presence on DishDetail.
          </p>
        </div>

        {error && (
          <div className="font-ui border-error text-error bg-error/10 mb-6 rounded-xl border px-5 py-3 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="restaurantName"
              className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
            >
              Restaurant Name <span className="text-error">*</span>
            </label>
            <input
              id="restaurantName"
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm transition-all duration-200 outline-none focus:ring-1"
              placeholder="e.g. Luigi's Trattoria"
            />
          </div>

          <div>
            <label
              htmlFor="cuisine"
              className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
            >
              Cuisine Tags <span className="text-error">*</span>
            </label>
            <input
              id="cuisine"
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm transition-all duration-200 outline-none focus:ring-1"
              placeholder="e.g. Italian, Pizza, Pasta"
            />
            <p className="text-on-surface-variant/60 font-ui mt-1 text-xs">
              Separate multiple tags with commas.
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="font-ui bg-surface-container-high text-on-surface focus:ring-primary field-sizing-content w-full resize-none rounded-2xl border-none px-5 py-3 text-sm wrap-anywhere transition-all duration-200 outline-none focus:ring-1"
              placeholder="Tell us about your restaurant..."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="address"
                className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm transition-all duration-200 outline-none focus:ring-1"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm transition-all duration-200 outline-none focus:ring-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="hours"
                className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
              >
                Hours
              </label>
              <input
                id="hours"
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm transition-all duration-200 outline-none focus:ring-1"
                placeholder="e.g. Mon-Sun: 11am - 10pm"
              />
            </div>
            <div>
              <label
                htmlFor="website"
                className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
              >
                Website URL
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm transition-all duration-200 outline-none focus:ring-1"
                placeholder="https://"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="image-upload"
              className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
            >
              Cover Image (Optional)
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="font-ui bg-surface-container-high text-on-surface focus:ring-primary file:bg-primary file:text-on-primary w-full cursor-pointer rounded-xl border-none px-5 py-3 text-sm transition-all duration-200 file:mr-4 file:cursor-pointer file:rounded-xl file:border-none file:px-4 file:py-2 file:text-sm file:font-semibold file:transition-all hover:file:brightness-110 focus:ring-1"
            />
            {imagePreview && (
              <div className="mt-4 overflow-hidden rounded-2xl">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="gold-gradient text-on-secondary font-ui w-full cursor-pointer rounded-xl border-none px-8 py-3 text-sm font-bold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
